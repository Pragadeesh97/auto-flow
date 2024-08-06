import React from "react";
import { AppBar } from "./Appbar";
import { useForm } from "react-hook-form";
import { InputField } from "./InputField";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type FormInputs = {
  email: string;
  name: string;
  password: string;
};

type SignupFormProps = {
  onSubmit: any;
  register: any;
};

const SignupForm: React.FC<SignupFormProps> = ({ onSubmit, register }) => (
  <form onSubmit={onSubmit}>
    <InputField
      id="email"
      label="Email"
      placeholder="Enter your email"
      register={register}
    />
    <InputField
      id="name"
      label="Name"
      placeholder="Enter your name"
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
      value="Signup"
      className="rounded-3xl bg-[#7C3AED] px-4 py-1.5 cursor-pointer hover:bg-[#562EB6] font-medium mt-7"
    />
  </form>
);

const Signup: React.FC = () => {
  const { handleSubmit, register } = useForm<FormInputs>();
  const navigate = useNavigate();
  async function onSignUp(data: FormInputs) {
    console.log(data);
    const result = await axios.post("http://localhost:3000/user/signup/", data);
    console.log(result);
    navigate("/signin");
  }
  return (
    <>
      <AppBar showSignUp={false} showSignIn={true} />
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
              <SignupForm
                onSubmit={handleSubmit((data) => onSignUp(data))}
                register={register}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Signup;
