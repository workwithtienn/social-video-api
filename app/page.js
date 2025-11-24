import React, { useState } from 'react';
import { Download, AlertCircle, CheckCircle, Loader2, Video, Image } from 'lucide-react';

export default function TikTokDouyinDownloader() {
  const [url, setUrl] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState(null);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString('vi-VN');
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  const extractVideoId = (inputUrl) => {
    const patterns = [
      /video\/(\d+)/,
      /v\.douyin\.com\/([A-Za-z0-9]+)/,
      /tiktok\.com\/@[\w.]+\/video\/(\d+)/,
      /vm\.tiktok\.com\/([A-Za-z0-9]+)/,
      /vt\.tiktok\.com\/([A-Za-z0-9]+)/,
      /tiktok\.com\/t\/([A-Za-z0-9]+)/
    ];
    
    for (const pattern of patterns) {
      const match = inputUrl.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleDownload = async () => {
    if (!url.trim()) {
      addLog('Vui lòng nhập link video!', 'error');
      return;
    }

    setLoading(true);
    setVideoData(null);
    setLogs([]);
    
    addLog('Bắt đầu xử lý...', 'info');
    addLog(`URL đầu vào: ${url}`, 'info');

    try {
      const videoId = extractVideoId(url);
      if (videoId) {
        addLog(`✓ Đã trích xuất Video ID: ${videoId}`, 'success');
      }

      addLog('Đang gửi yêu cầu đến API...', 'info');
      
      const apiUrl = `https://api.douyin.wtf/api/hybrid/video_data?url=${encodeURIComponent(url)}&minimal=false`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      addLog(`✓ Nhận phản hồi từ server (Status: ${response.status})`, 'success');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.code !== 200) {
        throw new Error(data.message || 'API trả về lỗi');
      }

      addLog('✓ Phân tích dữ liệu thành công!', 'success');
      
      const videoInfo = data.data;
      setVideoData(videoInfo);

      addLog(`✓ Tiêu đề: ${videoInfo.desc || 'Không có tiêu đề'}`, 'info');
      addLog(`✓ Tác giả: ${videoInfo.author?.nickname || 'Không rõ'}`, 'info');
      addLog(`✓ Lượt thích: ${videoInfo.statistics?.digg_count || 0}`, 'info');
      addLog(`✓ Lượt xem: ${videoInfo.statistics?.play_count || 0}`, 'info');
      
      if (videoInfo.video?.play_addr?.url_list?.length > 0) {
        addLog('✓ Tìm thấy link video không watermark!', 'success');
      } else if (videoInfo.images?.length > 0) {
        addLog(`✓ Tìm thấy ${videoInfo.images.length} hình ảnh (Video dạng album)`, 'success');
      }
      
      addLog('✓ Hoàn thành! Bạn có thể tải xuống bên dưới.', 'success');

    } catch (error) {
      addLog(`✗ Lỗi: ${error.message}`, 'error');
      addLog('Gợi ý: Kiểm tra lại link hoặc thử link khác', 'error');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectDownload = async (downloadUrl, filename) => {
    try {
      addLog(`Đang tải xuống: ${filename}...`, 'info');
      
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      addLog(`✓ Đã tải xuống: ${filename}`, 'success');
    } catch (error) {
      addLog(`✗ Không thể tải xuống: ${error.message}`, 'error');
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <Loader2 className="w-4 h-4 animate-spin" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-8 text-white">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Video className="w-10 h-10" />
              TikTok & Douyin Downloader
            </h1>
            <p className="text-purple-100">Tải video không watermark - Hỗ trợ TikTok & Douyin</p>
          </div>

          <div className="p-8">
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-3 text-lg">
                Nhập link video:
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleDownload()}
                  placeholder="https://www.tiktok.com/@username/video/... hoặc https://v.douyin.com/..."
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-base"
                  disabled={loading}
                />
                <button
                  onClick={handleDownload}
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2 whitespace-nowrap"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Tải ngay
                    </>
                  )}
                </button>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                💡 Hỗ trợ: TikTok (tiktok.com), Douyin (douyin.com), link rút gọn (vm.tiktok.com, v.douyin.com)
              </p>
            </div>

            {logs.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Loader2 className="w-5 h-5" />
                  Process Log:
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 max-h-64 overflow-y-auto border-2 border-gray-200">
                  {logs.map((log, index) => (
                    <div key={index} className={`flex items-start gap-2 mb-2 text-sm ${getLogColor(log.type)}`}>
                      {getLogIcon(log.type)}
                      <span className="text-gray-400 text-xs">[{log.timestamp}]</span>
                      <span className="flex-1">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {videoData && (
              <div className="border-2 border-purple-200 rounded-xl p-6 bg-purple-50">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  Thông tin video:
                </h3>
                
                <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                  <p className="text-gray-700 mb-2">
                    <span className="font-semibold">Tiêu đề:</span> {videoData.desc || 'Không có tiêu đề'}
                  </p>
                  <p className="text-gray-700 mb-2">
                    <span className="font-semibold">Tác giả:</span> {videoData.author?.nickname || 'Không rõ'}
                  </p>
                  <p className="text-gray-700 mb-2">
                    <span className="font-semibold">Thời lượng:</span> {videoData.video?.duration ? `${videoData.video.duration}s` : 'N/A'}
                  </p>
                  <div className="flex gap-4 text-sm text-gray-600 mt-3">
                    <span>👍 {videoData.statistics?.digg_count || 0} lượt thích</span>
                    <span>💬 {videoData.statistics?.comment_count || 0} bình luận</span>
                    <span>👁 {videoData.statistics?.play_count || 0} lượt xem</span>
                  </div>
                </div>

                {videoData.video?.play_addr?.url_list?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Video className="w-5 h-5" />
                      Video không watermark:
                    </h4>
                    {videoData.video.play_addr.url_list.map((videoUrl, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <a
                          href={videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all text-center transform hover:scale-105 active:scale-95 shadow-md"
                        >
                          Tải video (Link {index + 1})
                        </a>
                      </div>
                    ))}
                  </div>
                )}

                {videoData.images && videoData.images.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Image className="w-5 h-5" />
                      Hình ảnh ({videoData.images.length} ảnh):
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {videoData.images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img.url_list[0]}
                            alt={`Image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg shadow-md"
                          />
                          <a
                            href={img.url_list[0]}
                            download={`image_${index + 1}.jpg`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                          >
                            <Download className="w-8 h-8 text-white" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {videoData.music && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-700">
                      🎵 <span className="font-semibold">Nhạc nền:</span> {videoData.music.title}
                    </p>
                    {videoData.music.play_url && (
                      <a
                        href={videoData.music.play_url.url_list[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm underline mt-1 inline-block"
                      >
                        Tải nhạc nền
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-gray-600 text-sm">
          <p>💡 Sử dụng API: api.douyin.wtf | Không lưu trữ video | Hoàn toàn miễn phí</p>
          <p className="mt-2">⚠️ Chỉ sử dụng cho mục đích cá nhân, tôn trọng bản quyền tác giả</p>
        </div>
      </div>
    </div>
  );
}
