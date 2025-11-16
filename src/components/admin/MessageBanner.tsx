interface MessageBannerProps {
  message: string;
  type?: "success" | "error";
}

export default function MessageBanner({ message, type = "success" }: MessageBannerProps) {
  if (!message) return null;

  const bgColor = type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700";

  return (
    <div className={`mb-4 p-3 ${bgColor} rounded-lg font-semibold`}>
      {message}
    </div>
  );
}

