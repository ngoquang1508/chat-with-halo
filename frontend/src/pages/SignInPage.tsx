import { SigninForm } from "@/components/auth/signin-form";

const SignInPage = () => {
  return (
    <div className="min-h-screen w-full bg-[#000000] relative flex items-center justify-center overflow-hidden">
      
      {/* Nền chấm trắng (Dotted Grid) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: "#000000",
          backgroundImage: `
            radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: "30px 30px",
          backgroundPosition: "0 0",
        }}
      />

      {/* Lớp ánh sáng trắng mờ ở trung tâm để tạo chiều sâu */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.03) 0%, transparent 70%)"
        }}
      />

      {/* Form đăng nhập */}
      <div className="relative z-10 w-full max-w-sm md:max-w-4xl p-4">
        <SigninForm />
      </div>

    </div>
  );
};

export default SignInPage;