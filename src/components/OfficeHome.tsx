import { AppType } from '../App';

interface Props {
  onSelectApp: (app: AppType) => void;
}

export default function OfficeHome({ onSelectApp }: Props) {
  const apps = [
    { id: 'word' as AppType, name: 'Word', icon: '📝', color: '#2b579a', desc: 'Buat dokumen profesional' },
    { id: 'excel' as AppType, name: 'Excel', icon: '📊', color: '#217346', desc: 'Analisis data dengan spreadsheet' },
    { id: 'powerpoint' as AppType, name: 'PowerPoint', icon: '📽️', color: '#d24726', desc: 'Buat presentasi yang menarik' },
  ];

  return (
    <div className="w-full h-screen bg-[#f3f3f3] flex flex-col">
      {/* Title Bar */}
      <div className="h-8 bg-[#2b579a] flex items-center px-4 text-white text-sm">
        <span className="font-semibold">Microsoft Office</span>
        <div className="ml-auto flex items-center gap-1">
          <button className="w-10 h-8 hover:bg-white/10 flex items-center justify-center">─</button>
          <button className="w-10 h-8 hover:bg-white/10 flex items-center justify-center">□</button>
          <button className="w-10 h-8 hover:bg-red-600 flex items-center justify-center">✕</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-[#2b579a] mb-2">Microsoft Office</h1>
          <p className="text-gray-500 text-lg">Pilih aplikasi untuk memulai</p>
        </div>

        <div className="flex gap-8 flex-wrap justify-center">
          {apps.map((app) => (
            <div
              key={app.id}
              onClick={() => onSelectApp(app.id)}
              className="w-64 h-80 bg-white rounded shadow-md hover:shadow-xl cursor-pointer transition-all duration-200 hover:-translate-y-1 overflow-hidden group"
            >
              <div
                className="h-40 flex items-center justify-center"
                style={{ backgroundColor: app.color }}
              >
                <span className="text-7xl group-hover:scale-110 transition-transform duration-200">{app.icon}</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2" style={{ color: app.color }}>{app.name}</h3>
                <p className="text-gray-500 text-sm">{app.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Files Section */}
        <div className="mt-12 w-full max-w-4xl">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Dokumen Terbaru</h2>
          <div className="bg-white rounded shadow p-4">
            <div className="text-gray-400 text-center py-8">
              <p className="text-4xl mb-2">📂</p>
              <p>Belum ada dokumen terbaru</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="h-6 bg-[#2b579a] flex items-center px-4 text-white/70 text-xs">
        <span>Microsoft Office Suite - Web Edition</span>
      </div>
    </div>
  );
}
