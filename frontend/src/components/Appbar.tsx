export function AppBar() {
  return (
    <div className=" bg-[#191919] text-[white] flex justify-between pl-2 pr-2 items-center h-14">
      <div className="font-medium">AutoFlow</div>

      <div className="flex gap-3 font-normal">
        <div className="rounded-md border-2 border-[#7C3AED] p-1.5 cursor-pointer font-medium hover:border-[#562EB6]">
          Login
        </div>
        <div className="rounded-md bg-[#7C3AED] p-1.5 cursor-pointer hover:bg-[#562EB6] font-medium">
          Signup
        </div>
      </div>
    </div>
  );
}
