import axios from "axios";
import { AppBar } from "./Appbar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Workflow = {
  id: number;
  name: string;
  createdBy: string;
  createdAt: string; // Consider using Date type if you parse the date in code
  isActive: boolean;
  actions: Action[];
  trigger: Trigger;
};

type Action = {
  id: number;
  workflowId: number;
  availableActionId: number;
  meta: Record<string, any>; // Use a more specific type if you know the shape of meta
  order: number;
  type: ActionType;
};

type ActionType = {
  id: number;
  name: string;
  meta: Record<string, any>; // Use a more specific type if you know the shape of meta
};

type Trigger = {
  id: number;
  workflowId: number;
  meta: Record<string, any>; // Use a more specific type if you know the shape of meta
  availableTriggerId: number;
  type: TriggerType;
};

type TriggerType = {
  id: number;
  name: string;
};

export default function Workflows() {
  const [workflows, setWorkflows] = useState<Array<Workflow> | []>([]);

  useEffect(() => {
    async function fetchWorkflows() {
      try {
        const workflowResult = await axios.get(
          "http://localhost:3000/workflow/",
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        );
        console.log(workflowResult);
        setWorkflows(workflowResult.data?.workflows);
      } catch (e) {
        console.log("Error on fetching workflow data...", e);
      }
    }
    fetchWorkflows();
  }, []);
  console.log("workflows", workflows);
  return (
    <>
      <AppBar showSignIn={false} showSignUp={false} />
      <div className="bg-[#222222] h-screen text-white">
        <div className="flex flex-row-reverse pr-3 ">
          <CreateWorkflowButton />
        </div>
        <div className="font-semibold pl-2 m-2">My Workflows</div>
        {workflows.length > 0 ? (
          workflows.map((workflow) => {
            return (
              <WorkflowDisplay
                key={workflow.id}
                name={workflow.name}
              ></WorkflowDisplay>
            );
          })
        ) : (
          <div className="flex h-screen items-center justify-center">
            {" "}
            Loading...
          </div>
        )}
      </div>
    </>
  );
}

function WorkflowDisplay({ key, name }: { key: number; name: any }) {
  return (
    <div
      key={key}
      className="flex border border-gray-500 p-2 rounded-md mt-2 hover:bg-slate-300 hover:text-black m-2 h-16 items-center pl-4 hover: cursor-pointer"
    >
      {name}
    </div>
  );
}

function CreateWorkflowButton() {
  const navigate = useNavigate();
  return (
    <div
      className="rounded-3xl bg-[#7C3AED] px-4 py-1.5 cursor-pointer hover:bg-[#562EB6] font-medium w-fit mt-2"
      onClick={() => {
        navigate("/workflow/create");
      }}
    >
      Create
    </div>
  );
}
