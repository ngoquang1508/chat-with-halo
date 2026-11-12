const ChatWelcomeScreen = () => {
  return (
    <div className="flex flex-col w-full h-full bg-transparent">
      <div className="flex bg-background relative flex-1 items-center justify-center overflow-hidden border-l border-border/50 transition-colors duration-500">
        {/* Nền lưới chuyển động (Animated Grid) */}
        <div
          className="absolute inset-0 opacity-[0.4] dark:opacity-[0.1] pointer-events-none animate-grid-slow text-foreground/10"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>
    </div>
  );
};

export default ChatWelcomeScreen;
