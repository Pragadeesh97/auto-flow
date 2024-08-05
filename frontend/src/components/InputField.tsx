// Props for InputField component
type InputFieldProps = {
  id: any;
  label: string;
  placeholder: string;
  type?: string;
  register: any;
};

// Reusable InputField component
export const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  placeholder,
  type = "text",
  register,
}) => (
  <div className="mt-5">
    <div>
      <label htmlFor={id}>{label}</label>
    </div>
    <div>
      <input
        id={id}
        placeholder={placeholder}
        type={type}
        {...register(id)}
        className="text-black ring-none border-none focus:ring-4 focus:ring-[#562EB6] focus:border-none focus:outline-none p-1 rounded-sm mt-1"
      />
    </div>
  </div>
);
