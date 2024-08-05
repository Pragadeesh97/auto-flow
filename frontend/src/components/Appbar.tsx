import { useNavigate } from "react-router-dom";
interface AppBarType {
  showSignIn: boolean;
  showSignUp: boolean;
}
export function AppBar({ showSignIn, showSignUp }: AppBarType) {
  const navigate = useNavigate();
  return (
    <div className=" bg-[#191919] text-[white] flex justify-between pl-2 pr-2 items-center h-14">
      <div
        className="font-medium cursor-pointer"
        onClick={() => {
          navigate("/");
        }}
      >
        AutoFlow
      </div>

      <div className="flex gap-3 font-normal">
        {showSignIn && (
          <div
            className="rounded-3xl border-2 border-[#7C3AED] px-4 py-1.5 cursor-pointer font-medium hover:border-[#562EB6]"
            onClick={() => {
              navigate("/signin");
            }}
          >
            Login
          </div>
        )}
        {showSignUp && (
          <div
            className="rounded-3xl bg-[#7C3AED] px-4 py-1.5 cursor-pointer hover:bg-[#562EB6] font-medium"
            onClick={() => {
              navigate("/signup");
            }}
          >
            Signup
          </div>
        )}
      </div>
    </div>
  );
}
