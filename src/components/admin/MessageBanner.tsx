interface MessageBannerProps {
  message: string;
  type?: "success" | "error";
}

export default function MessageBanner({ message, type = "success" }: MessageBannerProps) {
  if (!message) return null;

  const textColor = type === "error" ? "text-red-900" : "text-green-900";

  return (
    <div className={`mb-4 p-4 bg-white ${textColor} rounded-xl font-bold border-4 border-black shadow-xl relative`} style={{ fontFamily: "'Pirata One', cursive" }}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <img 
            src="/skully.png" 
            alt="Skully the Parrot" 
            className="w-16 h-16 object-contain"
          />
        </div>
        <div className="flex-1">
          <div className="text-lg mb-1">Skully squawks:</div>
          <div className="text-xl">"{message}"</div>
        </div>
      </div>
      {/* Speech bubble tail */}
      <div className="absolute -bottom-3 left-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-black"></div>
    </div>
  );
}

