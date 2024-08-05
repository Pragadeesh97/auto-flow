import { AppBar } from "./Appbar";
import { InputField } from "./InputField";
import { useForm } from "react-hook-form";

type FormInputs = {
  email: string;
  password: string;
};
type SignInFormProps = {
  onSubmit: any;
  register: any;
};

const SignInForm: React.FC<SignInFormProps> = ({ onSubmit, register }) => (
  <form onSubmit={onSubmit}>
    <InputField
      id="email"
      label="Email"
      placeholder="Enter your email"
      register={register}
    />
    <InputField
      id="password"
      label="Password"
      placeholder="Password"
      type="password"
      register={register}
    />
    <input
      type="submit"
      value="Login"
      className="rounded-3xl bg-[#7C3AED] px-4 py-1.5 cursor-pointer hover:bg-[#562EB6] font-medium mt-7"
    />
  </form>
);

const SignIn: React.FC = () => {
  const { handleSubmit, register } = useForm<FormInputs>();

  return (
    <>
      <AppBar showSignIn={false} showSignUp={true} />
      <div className="h-[100vh] overflow-hidden">
        <div className="grid grid-cols-2 bg-[#222222] text-white h-full">
          <div className="flex col-span-1 justify-center items-center">
            <div className="pl-20">
              <div className="text-2xl font-bold">
                Automate across your teams
              </div>
              <div className="mt-7 text-lg">
                Autoflow empowers everyone in your business to securely automate
                their work in minutes, not months—no coding required.
              </div>
            </div>
          </div>

          <div className="flex col-span-1 items-center pl-20">
            <div className="border-[0.5px] rounded-md border-gray-400 h-[350px] w-[350px] p-5">
              <SignInForm
                onSubmit={handleSubmit((data) => console.log(data))}
                register={register}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;
