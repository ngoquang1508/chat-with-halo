import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "../ui/label";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/common/Logo";

const signUpSchema = z.object({
  firstname: z.string().min(1, "Tên bắt buộc phải có"),
  lastname: z.string().min(1, "Họ bắt buộc phải có"),
  username: z.string().min(3, "Tên đăng nhập tối thiểu 3 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signUp } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // State quản lý phần trăm load
  const [progress, setProgress] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  });

  // Hiệu ứng giả lập tăng phần trăm khi đang gọi API
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isSubmitting) {
      // Bắt đầu từ 0 khi nhấn nút
      setProgress(0);

      interval = setInterval(() => {
        setProgress((prev) => {
          // Tự động tăng đến 94% rồi dừng lại chờ API thực tế
          if (prev < 94) {
            const increment = Math.floor(Math.random() * 15) + 1; // Nhảy số ngẫu nhiên cho thật
            return Math.min(prev + increment, 94);
          }
          return prev;
        });
      }, 150);
    } else if (progress !== 100) {
      // Nếu không submit và chưa đạt 100 (ví dụ lỗi validation), reset về 0
      setProgress(0);
    }

    return () => clearInterval(interval);
  }, [isSubmitting, progress]);

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      const { firstname, lastname, username, email, password } = data;

      // Chạy song song: API và một Promise chờ tối thiểu 1.5 giây
      // Điều này đảm bảo dù API xong trong 100ms thì vẫn phải đợi đủ 1.5s để hiệu ứng chạy đẹp
      await Promise.all([
        signUp(username, password, email, firstname, lastname),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]);

      // Sau khi cả 2 xong:
      setProgress(100);

      // Đợi thêm một chút để nhìn thấy số 100% rực rỡ
      setTimeout(() => {
        navigate("/signin");
      }, 600);
    } catch (error) {
      console.error("Signup failed:", error);
      setProgress(0);
      // Có thể thêm toast thông báo lỗi ở đây
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-white/10 bg-black/60 backdrop-blur-xl shadow-[0_0_40px_rgba(255,255,255,0.05)]">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            className="p-6 md:p-10 text-white"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-center text-center gap-2 mb-2">
                <Logo size={48} className="mg-3" />
                <h1 className="text-2xl font-bold tracking-tighter text-white uppercase">
                  Tạo tài khoản HALO
                </h1>
                <p className="text-white/50 text-sm font-light">
                  Bắt đầu trò chuyện cùng HALO
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[12px] uppercase tracking-widest text-white/60">
                    Họ
                  </Label>
                  <Input
                    {...register("lastname")}
                    className="bg-white/5 border-white/10 focus:border-white/40 text-white"
                  />
                  {errors.lastname && (
                    <p className="text-red-400 text-[12px]">
                      {errors.lastname.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-[12px] uppercase tracking-widest text-white/60">
                    Tên
                  </Label>
                  <Input
                    {...register("firstname")}
                    className="bg-white/5 border-white/10 focus:border-white/40 text-white"
                  />
                  {errors.firstname && (
                    <p className="text-red-400 text-[12px]">
                      {errors.firstname.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[12px] uppercase tracking-widest text-white/60">
                  Tên đăng nhập
                </Label>
                <Input
                  {...register("username")}
                  className="bg-white/5 border-white/10 focus:border-white/40 text-white"
                  placeholder="halo"
                />
                {errors.username && (
                  <p className="text-red-400 text-[12px]">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-[12px] uppercase tracking-widest text-white/60">
                  Email
                </Label>
                <Input
                  {...register("email")}
                  type="email"
                  className="bg-white/5 border-white/10 focus:border-white/40 text-white"
                  placeholder="halo@gmail.com"
                />
                {errors.email && (
                  <p className="text-red-400 text-[12px]">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-[12px] uppercase tracking-widest text-white/60">
                  Mật khẩu
                </Label>
                <div className="relative">
                  <Input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    className="bg-white/5 border-white/10 focus:border-white/40 text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-all"
                  >
                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-[12px]">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                disabled={isSubmitting}
                className="w-full bg-white text-black hover:bg-white/90 font-bold py-6 mt-2 uppercase transition-all active:scale-[0.98] tracking-widest text-xs"
              >
                {isSubmitting ? "Đang xử lý..." : "Tạo tài khoản"}
              </Button>

              <div className="text-center text-xs text-white/30">
                Bạn đã có tài khoản?{" "}
                <a
                  href="/signin"
                  className="text-white hover:underline font-medium"
                >
                  Đăng nhập
                </a>
              </div>
            </div>
          </form>

          {/* Banner side */}
          <div className="relative hidden md:block bg-[#000000] border-l border-white/10 overflow-hidden">
            <div
              className="absolute inset-0 z-0"
              style={{ perspective: "600px" }}
            >
              <div
                className="absolute inset-0 animate-grid-slow"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(255, 255, 255, 0.15) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 1px, transparent 1px)
                  `,
                  backgroundSize: "30px 30px",
                  transform: "rotateX(65deg) scale(2.5)",
                  transformOrigin: "center top",
                  height: "300%",
                }}
              />
            </div>

            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
              <div className="w-full h-25 bg-linear-to-b from-transparent via-white/10 to-transparent absolute top-0 left-0 animate-[scan_4s_linear_infinite]" />
            </div>

            <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-black z-20" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] z-20" />

            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 z-30 text-center">
              <div className="relative group">
                <div className="absolute -inset-10 bg-white/5 blur-3xl rounded-full opacity-40 group-hover:opacity-100 transition-opacity" />
                <div className="relative space-y-6">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-white/40 text-[9px] uppercase tracking-[0.5em] font-medium">
                      khởi tạo tài khoản
                    </span>
                    <h2 className="text-white text-4xl font-black tracking-tighter uppercase italic drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                      HALO<span className="text-white/20">.</span>TALK
                    </h2>
                  </div>

                  <div className="flex flex-col items-center gap-5">
                    <div className="h-0.5 w-32 bg-linear-to-r from-transparent via-white/50 to-transparent" />
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-2 h-2 bg-white rounded-full",
                          isSubmitting && "animate-ping",
                        )}
                      />
                      <p className="text-[10px] text-white/60 tracking-[0.4em] font-bold uppercase">
                        {progress === 100
                          ? "Khởi tạo thành công"
                          : "Tạo danh tính mới"}
                      </p>
                    </div>

                    {/* ĐOẠN HIỂN THỊ PHẦN TRĂM CHẠY */}
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-[9px] text-white/40 tracking-[0.3em] font-light uppercase mt-2 min-w-50">
                        {isSubmitting || progress === 100 ? (
                          <>
                            {progress === 100
                              ? "Hoàn tất hồ sơ... "
                              : "Đang thiết lập hồ sơ... "}
                            <span className="text-white font-bold tabular-nums italic">
                              {progress}%
                            </span>
                          </>
                        ) : (
                          "Hệ thống sẵn sàng"
                        )}
                      </p>
                      {/* Thanh progress bar mỏng (Optional) */}
                      {(isSubmitting || progress === 100) && (
                        <div className="w-32 h-px bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-white transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-center text-white/40 tracking-[2px] uppercase">
        Bằng cách tiếp tục, bạn đồng ý với{" "}
        <a href="#" className="underline hover:text-white/80 transition-colors">
          Điều khoản
        </a>{" "}
        &{" "}
        <a href="#" className="underline hover:text-white/80 transition-colors">
          Bảo mật
        </a>
      </div>
    </div>
  );
}
