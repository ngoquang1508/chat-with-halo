import { useState } from "react";
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

const signInSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập ít nhất 3 kí tự"),
  password: z.string().min(6, "Mật khẩu ít nhất 6 kí tự"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export function SigninForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signIn } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormValues) => {
    await signIn(data.username, data.password);
    navigate("/");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-white/10 bg-black/60 backdrop-blur-xl shadow-[0_0_40px_rgba(255,255,255,0.05)]">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            className="p-6 md:p-10 text-white"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center gap-2 mb-2">
                {/* Logo HALO / KORD */}
                <Logo size={48} className="mg-3" />

                <h1 className="text-2xl font-bold tracking-tighter text-white uppercase">
                  Đăng nhập HALO
                </h1>
                <p className="text-white/50 text-sm font-light">
                  Chào mừng trở lại với HALO
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-[12px] uppercase tracking-widest text-white/60"
                  >
                    Tên đăng nhập
                  </Label>
                  <Input
                    {...register("username")}
                    className="bg-white/5 border-white/10 focus:border-white/40 text-white placeholder:text-white/20"
                    placeholder="halo"
                  />
                  {errors.username && (
                    <p className="text-red-400 text-[12px]">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-[12px] uppercase tracking-widest text-white/60"
                  >
                    Mật khẩu
                  </Label>
                  <div className="relative">
                    <Input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      className="bg-white/5 border-white/10 focus:border-white/40 text-white pr-10"
                    />
                    {
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-all animate-in fade-in"
                      >
                        {showPassword ? (
                          <Eye size={16} />
                        ) : (
                          <EyeOff size={16} />
                        )}
                      </button>
                    }
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-[12px]">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  disabled={isSubmitting}
                  className="w-full bg-white text-black hover:bg-white/90 font-bold py-6 mt-2 transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
                >
                  {isSubmitting ? "Loading" : "ĐĂNG NHẬP"}
                </Button>
              </div>

              <div className="text-center text-xs text-white/30">
                Chưa có tài khoản?{" "}
                <a
                  href="/signup"
                  className="text-white hover:underline cursor-pointer font-medium"
                >
                  Đăng ký ngay
                </a>
              </div>
            </div>
          </form>

          {/* Banner side - Đồng bộ với Signup */}
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
                      Bắt Đầu Trò Chuyện
                    </span>
                    <h2 className="text-white text-4xl font-black tracking-tighter uppercase italic drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                      HALO<span className="text-white/20">.</span>MESSENGER
                    </h2>
                  </div>

                  <div className="flex flex-col items-center gap-5">
                    <div className="h-0.5 w-32 bg-linear-to-r from-transparent via-white/50 to-transparent" />
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                      <p className="text-[10px] text-white/60 tracking-[0.4em] font-bold uppercase">
                        Kết nối mọi cuộc trò chuyện
                      </p>
                    </div>
                    <p className="text-[9px] text-white/40 tracking-[0.3em] font-light uppercase mt-2">
                      Đang chờ bạn đăng nhập...{" "}
                      <span className="animate-pulse">Sẵn sàng</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
