import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router";

const Logout = () => {
  const { signOut } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/signin");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DropdownMenuItem
      className="cursor-pointer"
      variant="destructive"
      onClick={handleLogout}
    >
      <Button variant="completeGhost">
        <LogOut className="text-destructive" />
        Log out
      </Button>
    </DropdownMenuItem>
  );
};

export default Logout;
