import { Logo } from "@/components/common/Logo";
import { SidebarInset } from "../ui/sidebar";
import ChatWindowHeader from "./ChatWindowHeader";
import { useThemeStore } from "@/stores/useThemeStore";

const ChatWelcomeScreen = () => {
  const { isDark } = useThemeStore();

  return (
    <SidebarInset className="flex w-full h-full bg-transparent">
      <ChatWindowHeader />
      <div className="flex bg-background relative flex-1 items-center justify-center overflow-hidden border-l border-border/50 transition-colors duration-500">
        
        {/* 1. Nền lưới chuyển động (Animated Grid) */}
        <div
          className="absolute inset-0 opacity-[0.4] dark:opacity-[0.1] pointer-events-none animate-grid-slow text-foreground/10"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* 2. Hiệu ứng ánh sáng quét (Scanning Light) - Làm đậm hơn */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-primary/20 dark:via-primary/10 to-transparent h-[40%] w-full animate-scan pointer-events-none" />

        <div className="relative z-10 text-center">
          
          {/* 3. KHỐI TRUNG TÂM CẤU TRÚC NGUYÊN TỬ (Đã nâng cấp) */}
          <div className="relative size-48 mx-auto mb-10 flex items-center justify-center">
            
            {/* === CÁC LỚP VỎ NGUYÊN TỬ (Electron Shells) === */}
            
            {/* Lớp 1: Vòng ngoài cùng - Glow rộng, xoay chậm */}
            <div className="absolute inset-0 rounded-full border border-primary/30 dark:border-primary/20 animate-[spin_30s_linear_infinite] shadow-[0_0_60px_-10px_rgba(var(--primary),0.3)]" />
            
            {/* Lớp 2: Vòng giữa - Ping nhẹ, màu đậm hơn */}
            <div className="absolute inset-6 rounded-full border-2 border-primary/60 dark:border-primary/40 animate-[ping_4s_ease-in-out_infinite] shadow-[0_0_40px_rgba(var(--primary),0.2)]" />
            
            {/* Lớp 3: Vòng trong - Xoay ngược chiều, Border đậm */}
            <div className="absolute inset-12 rounded-full border-2 border-primary/90 animate-[spin_15s_linear_infinite_reverse] shadow-[inner_0_0_20px_rgba(var(--primary),0.2)]" />
            
            {/* === HẠT NHÂN NGUYÊN TỬ (Atomic Nucleus) === */}
            
            {/* Hào quang cốt lõi (Core Glow) - Đậm và tập trung hơn */}
            <div className="absolute inset-16 bg-primary/5 dark:bg-primary/30 blur-2xl rounded-full animate-pulse" />

            {/* Chấm tròn "Electron" chạy trên quỹ đạo */}
            <div className="absolute inset-0 animate-[spin_20s_linear_infinite]">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 size-2.5 bg-primary rounded-full shadow-[0_0_15px_5px_rgba(var(--primary),0.7)]" />
            </div>

            {/* === BOX LOGO CHÍNH (Nâng cấp Glassmorphism) === */}
            {/* Thêm shadow đậm màu primary để tạo độ nổi */}
            <div className="relative z-20 p-8 rounded-[2.5rem] border border-primary/30 bg-white/50 dark:bg-card/50 backdrop-blur-2xl shadow-[0_20px_50px_-10px_rgba(var(--primary),0.3)] dark:shadow-[0_0_60px_-10px_rgba(0,0,0,0.7)] group hover:scale-105 hover:border-primary/60 transition-all duration-500">
              <Logo size={70} className="text-primary animate-message-bounce" stroke={isDark ? "white" : "black"} />
              
              {/* Điểm nhấn ánh sáng nhỏ bên trong Box */}
              <div className="absolute top-4 right-4 size-1 bg-white/70 rounded-full blur-[1px]" />
            </div>
          </div>

          {/* 4. Typography */}
          <div className="space-y-3">
            {/* Tăng font-weight cho tên thương hiệu */}
            <h2 className="text-4xl font-black tracking-tighter text-foreground">
              HALO<span className="text-primary animate-pulse shadow-primary">.</span>TALK
            </h2>

            <div className="flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-linear-to-r from-transparent to-primary/70" />
              <span className="text-[10px] uppercase tracking-[0.4em] text-primary font-extrabold">
                System Encrypted
              </span>
              <span className="h-px w-8 bg-linear-to-l from-transparent to-primary/70" />
            </div>

            {/* Làm chữ mô tả rõ hơn một chút */}
            <p className="text-muted-foreground text-sm max-w-[320px] mx-auto leading-relaxed font-semibold dark:font-medium opacity-90 dark:opacity-70">
              Đang chờ tín hiệu từ các cuộc hội thoại của bạn...
            </p>
          </div>
        </div>

        {/* 5. Trang trí góc (Cyberpunk Corners) */}
        <div className="absolute bottom-8 right-8 text-[10px] font-mono text-primary/50 dark:text-primary/30 text-right select-none">
          <p className="flex items-center justify-end gap-2">
            <span className="size-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            NODE_STATUS: ACTIVE
          </p>
          <p>ENCRYPTION: AES-256</p>
          <p className="text-[8px] opacity-70">CORE_TEMP: NOMINAL</p>
        </div>
      </div>
    </SidebarInset>
  );
};

export default ChatWelcomeScreen;