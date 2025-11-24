import { NextResponse } from 'next/server';

async function expandUrl(shortUrl) {
  try {
    const response = await fetch(shortUrl, {
      method: 'HEAD',
      redirect: 'manual',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      }
    });
    
    const location = response.headers.get('location');
    if (location) {
      return location;
    }
    
    return shortUrl;
  } catch (error) {
    console.error('Error expanding URL:', error);
    return shortUrl;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }

  try {
    if (url.includes('v.douyin.com')) {
      const expandedUrl = await expandUrl(url);
      url = expandedUrl;
    }

    const apiUrl = `https://api.douyin.wtf/api/hybrid/video_data?url=${encodeURIComponent(url)}&minimal=false`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://douyin.wtf/',
      },
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== 200) {
      throw new Error(data.message || 'Failed to parse Douyin video');
    }

    const videoInfo = data.data;
    
    const normalizedData = {
      code: 0,
      msg: 'success',
      data: {
        title: videoInfo.desc || '',
        cover: videoInfo.video?.cover?.url_list?.[0] || videoInfo.video?.origin_cover?.url_list?.[0] || '',
        play: videoInfo.video?.play_addr?.url_list?.[0] || '',
        hdplay: videoInfo.video?.bit_rate?.[0]?.play_addr?.url_list?.[0] || '',
        duration: videoInfo.video?.duration || 0,
        author: {
          nickname: videoInfo.author?.nickname || '',
          unique_id: videoInfo.author?.unique_id || '',
          avatar: videoInfo.author?.avatar?.url_list?.[0] || ''
        },
        digg_count: videoInfo.statistics?.digg_count || 0,
        comment_count: videoInfo.statistics?.comment_count || 0,
        play_count: videoInfo.statistics?.play_count || 0,
        share_count: videoInfo.statistics?.share_count || 0,
        music: videoInfo.music?.title || '',
        music_info: {
          play: videoInfo.music?.play_url?.url_list?.[0] || ''
        },
        images: videoInfo.images?.map(img => img.url_list?.[0]) || []
      }
    };

    return NextResponse.json(normalizedData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });

  } catch (error) {
    console.error('Douyin API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch Douyin video data' },
      { status: 500 }
    );
  }
}
