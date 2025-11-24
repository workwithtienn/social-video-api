'use client';

import { useState } from 'react';
import { Download, AlertCircle, CheckCircle, Loader2, Video, Image, Music } from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState(null);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString('vi-VN');
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  const detectPlatform = (inputUrl) => {
    if (inputUrl.includes('douyin.com')) {
      return 'douyin';
    }
    return 'tiktok';
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
      const platform = detectPlatform(url);
      addLog(`✓ Phát hiện nền tảng: ${platform === 'douyin' ? 'Douyin' : 'TikTok'}`, 'success');
      
      const apiEndpoint = platform === 'douyin' ? '/api/douyin' : '/api/tiktok';
      addLog(`Đang gửi yêu cầu qua API proxy (${platform})...`, 'info');
      
      const response = await fetch(`${apiEndpoint}?url=${encodeURIComponent(url)}`);
      
      addLog(`✓ Nhận phản hồi từ server (Status: ${response.status})`, 'success');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.code !== 0) {
        throw new Error(data.msg || 'API trả về lỗi');
      }

      addLog('✓ Phân tích dữ liệu thành công!', 'success');
      
      const videoInfo = data.data;
      setVideoData(videoInfo);

      addLog(`✓ Tiêu đề: ${videoInfo.title || 'Không có tiêu đề'}`, 'info');
      addLog(`✓ Tác giả: ${videoInfo.author?.nickname || 'Không rõ'}`, 'info');
      addLog(`✓ Lượt thích: ${videoInfo.digg_count || 0}`, 'info');
      addLog(`✓ Lượt xem: ${videoInfo.play_count || 0}`, 'info');
      
      if (videoInfo.play) {
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
                  placeholder="https://www.tiktok.com/@username/video/... hoặc https://vt.tiktok.com/..."
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
                💡 Hỗ trợ: TikTok (tiktok.com), Douyin (douyin.com), link rút gọn (vm.tiktok.com, vt.tiktok.com)
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
                  {videoData.cover && (
                    <img 
                      src={videoData.cover} 
                      alt="Video Cover"
                      className="w-full h-64 object-cover rounded-lg mb-4"
                    />
                  )}
                  
                  <p className="text-gray-700 mb-2">
                    <span className="font-semibold">Tiêu đề:</span> {videoData.title || 'Không có tiêu đề'}
                  </p>
                  <p className="text-gray-700 mb-2">
                    <span className="font-semibold">Tác giả:</span> {videoData.author?.nickname || videoData.author?.unique_id || 'Không rõ'}
                  </p>
                  <p className="text-gray-700 mb-2">
                    <span className="font-semibold">Thời lượng:</span> {videoData.duration ? `${videoData.duration}s` : 'N/A'}
                  </p>
                  <div className="flex gap-4 text-sm text-gray-600 mt-3">
                    <span>👍 {videoData.digg_count || 0} lượt thích</span>
                    <span>💬 {videoData.comment_count || 0} bình luận</span>
                    <span>👁 {videoData.play_count || 0} lượt xem</span>
                    <span>🔄 {videoData.share_count || 0} chia sẻ</span>
                  </div>
                </div>

                {videoData.play && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Video className="w-5 h-5" />
                      Video không watermark:
                    </h4>
                    <div className="space-y-2">
                      <a
                        href={videoData.play}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="block px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all text-center transform hover:scale-105 active:scale-95 shadow-md"
                      >
                        📥 Tải video (SD Quality)
                      </a>
                      
                      {videoData.hdplay && (
                        <a
                          href={videoData.hdplay}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="block px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all text-center transform hover:scale-105 active:scale-95 shadow-md"
                        >
                          🎬 Tải video (HD Quality)
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {videoData.images && videoData.images.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Image className="w-5 h-5" />
                      Hình ảnh ({videoData.images.length} ảnh):
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {videoData.images.map((imgUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imgUrl}
                            alt={`Image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg shadow-md"
                          />
                          <a
                            href={imgUrl}
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
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-700 mb-2 flex items-center gap-2">
                      <Music className="w-4 h-4" />
                      <span className="font-semibold">Nhạc nền:</span> {videoData.music}
                    </p>
                    {videoData.music_info?.play && (
                      <a
                        href={videoData.music_info.play}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="inline-block mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-all"
                      >
                        🎵 Tải nhạc nền
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-gray-600 text-sm">
          <p>💡 Sử dụng API: tikwm.com | Không lưu trữ video | Hoàn toàn miễn phí</p>
          <p className="mt-2">⚠️ Chỉ sử dụng cho mục đích cá nhân, tôn trọng bản quyền tác giả</p>
        </div>
      </div>
    </div>
  );
}
