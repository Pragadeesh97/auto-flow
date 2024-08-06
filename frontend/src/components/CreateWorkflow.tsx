import { useImmer } from "use-immer";
import { AppBar } from "./Appbar";
import ReactDOM from "react-dom";
import { ReactNode, useEffect, useState } from "react";
import axios from "axios";
import { twMerge } from "tailwind-merge";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

type actionType = {
  availableActionId: number | null;
  actionMeta: any;
};
const INIT_ACTION_DATA: actionType = {
  availableActionId: null,
  actionMeta: null,
};

export function CreateWorkflow() {
  const [workflowData, setWorkflowData] = useImmer({
    trigger: {
      availableTriggerId: null,
      triggerMeta: null,
    },
    actions: [],
  });
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState();
  const [availableActions, setAvailableActions] = useState();
  const [availableTriggers, setAvailableTriggers] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const divRef = useRef(null);
  useEffect(() => {
    async function fetchActionsAndTriggers() {
      try {
        const actionResult = await axios.get(
          "http://localhost:3000/workflow/action",
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        );
        const triggerResult = await axios.get(
          "http://localhost:3000/workflow/trigger",
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        );
        if (actionResult.status == 200) {
          setAvailableActions(actionResult.data?.actions);
        }
        if (triggerResult.status == 200) {
          setAvailableTriggers(triggerResult.data?.triggers);
        }
        setIsLoading(false);
      } catch (e) {
        console.log("Some error occured, please try later");
      }
    }
    fetchActionsAndTriggers();
  }, []);

  async function handlePublish() {
    const createWorkflowPayload = {
      workflowName: workflowName,
      triggerMeta: {},
      availableTriggerId: parseInt(workflowData.trigger.availableTriggerId),
      actions: workflowData.actions,
    };
    console.log("workflow payload is ", createWorkflowPayload);

    setIsLoading(true);
    try {
      const result = await axios.post(
        "http://localhost:3000/workflow/",
        createWorkflowPayload,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      console.log("result", result);

      if (result.status == 200) {
        navigate("/workflows");
        setIsLoading(false);
      }
    } catch (e) {
      console.log("Error while cretaing a workflow");
    }
  }
  useEffect(() => {
    const div = divRef.current;
    if (div && div.innerText.length > 0) {
      const range = document.createRange();
      const sel = window.getSelection();
      range.setStart(div.childNodes[0], div.innerText.length);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [workflowName]);
  console.log("Available triggers", availableTriggers);
  console.log("Available Actions", availableActions);
  console.log("Workflow name", workflowName);
  if (isLoading)
    return (
      <div className="h-screen flex justify-center items-center bg-[#222222] text-white">
        Loading...
      </div>
    );
  return (
    <>
      <AppBar showSignIn={false} showSignUp={false} />
      <div className="flex justify-between bg-[#222222] px-5 pt-1">
        <div
          ref={divRef}
          className="flex border-b-[1px] border-gray-300 text-white focus:ring-none focus:outline-none items-center bg-[#222222] min-w-[100px]"
          contentEditable
          onInput={(e) => {
            console.log("name is being changed", e.target.innerText);
            setWorkflowName(e.target.innerText);
          }}
        >
          {workflowName}
        </div>
        <PublishWorkflowButton onClick={handlePublish} />
      </div>
      <div className="flex bg-[#222222] h-screen justify-center items-center text-white">
        <div className="">
          <div
            className="w-[100px] h-[50px] border flex items-center justify-center text-center rounded-md font-medium text-sm hover:bg-slate-200 cursor-pointer hover:text-black"
            onClick={() => {
              setIsModalOpen(true);
              setSelectedItem({ type: "trigger", index: null });
            }}
          >
            Trigger
          </div>

          <Connector />

          {workflowData &&
            workflowData?.actions.map((element, index) => {
              return (
                <>
                  <Action
                    label={`Action #${index + 1}`}
                    key={index}
                    onClick={() => {
                      setIsModalOpen(true);
                      setSelectedItem({ type: "action", index: index });
                    }}
                  />
                  <Connector />
                </>
              );
            })}
          <div className="flex justify-center items-center font-medium">
            <div
              className="flex w-[40px] h-[20px] bg-[#7C3AED] rounded-lg text-white items-center justify-center cursor-pointer"
              onClick={() => {
                const actionsTemp = structuredClone(
                  workflowData.actions
                ) as unknown as Array<actionType>;
                if (actionsTemp.length <= 2) {
                  console.log("actionsTemp", actionsTemp);
                  actionsTemp.push(INIT_ACTION_DATA);
                  setWorkflowData((workflowData: any) => {
                    workflowData.actions = actionsTemp;
                  });
                } else {
                  alert("Cannot add more than 3 actions");
                }
              }}
            >
              +
            </div>
          </div>
          <ConfigurerModal
            isModalOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            availableActions={availableActions}
            availableTriggers={availableTriggers}
            selectedItem={selectedItem}
            onFinish={(type, index, data) => {
              console.log("onFinish called");
              if (type == "trigger") {
                setWorkflowData((prevData) => {
                  prevData.trigger = data;
                });
              } else {
                const tempActionData = structuredClone(workflowData.actions);
                tempActionData[index] = {
                  availableActionId: data.selectedActionId,
                  actionMeta: data.actionMeta,
                };
                setWorkflowData((data) => {
                  data.actions = tempActionData;
                });
              }
            }}
          />
        </div>
      </div>
    </>
  );
}

function ConfigurerModal({
  isModalOpen,
  onClose,
  availableActions,
  availableTriggers,
  selectedItem,
  onFinish,
}) {
  const [selectedActionType, setSelectedActionType] = useState();
  const [selectedTriggerType, setSelectedTriggerType] = useState();
  const [step, setStep] = useState(1);
  const [actionData, setActionData] = useImmer({ to: "", body: "" });
  return (
    <Modal
      isOpen={isModalOpen}
      onClose={() => {
        onClose(false);
        setStep(1);
      }}
      title={
        selectedItem?.type == "trigger"
          ? "Configure Trigger"
          : "Configure Action"
      }
    >
      <div className="flex flex-col justify-between h-[200px] w-[300px] pt-5">
        <div className="">
          {selectedItem?.type == "trigger"
            ? availableTriggers.map((trigger: any) => {
                return (
                  <div
                    className={twMerge(
                      "h-[40px] border border-gray-300 p-2 rounded-sm flex items-center hover:bg-slate-300 cursor-pointer",
                      trigger?.id == selectedTriggerType?.id
                        ? "bg-slate-400"
                        : ""
                    )}
                    onClick={() => {
                      setSelectedTriggerType(trigger);
                    }}
                  >
                    {trigger.name}
                  </div>
                );
              })
            : availableActions.map((action: any, index) => {
                return step == 1 ? (
                  <div
                    key={index}
                    className={twMerge(
                      "h-[40px] border border-gray-300 p-2 rounded-sm flex items-center hover:bg-slate-300 cursor-pointer",
                      action?.id == selectedActionType?.id ? "bg-slate-400" : ""
                    )}
                    onClick={() => {
                      setSelectedActionType(action);
                      setStep((prev) => prev + 1);
                    }}
                  >
                    {action.name}
                  </div>
                ) : (
                  <>
                    <div>
                      <label htmlFor="to_email">To</label>
                    </div>
                    <div className="mt-2">
                      <input
                        id="to_email"
                        placeholder="email parser"
                        onChange={(e) => {
                          setActionData((data) => {
                            data.to = e.target.value;
                          });
                        }}
                      />
                    </div>
                    <div className="mt-3">
                      <label htmlFor="body_email">Body</label>
                    </div>
                    <div>
                      <input
                        className="mt-2"
                        id="id_email"
                        placeholder="body parser"
                        onChange={(e) => {
                          setActionData((data) => {
                            data.body = e.target.value;
                          });
                        }}
                      />
                    </div>
                  </>
                );
              })}
        </div>
        <div className="flex  flex-row-reverse">
          <button
            className="bg-[#7C3AED] p-2 px-4 rounded-3xl text-white font-medium hover:bg-[#562EB6]"
            onClick={() => {
              onFinish(
                selectedItem.type == "trigger" ? "trigger" : "action",
                0,
                selectedItem.type == "trigger"
                  ? {
                      availableTriggerId: parseInt(selectedTriggerType.id),
                      triggerMeta: {},
                    }
                  : {
                      selectedActionId: parseInt(selectedActionType.id),
                      actionMeta: actionData,
                    }
              );
              setStep(1);
              onClose();
            }}
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Connector() {
  return (
    <div className="flex justify-center">
      <div className="w-[0px] h-[25px] border"></div>
    </div>
  );
}
function Action({
  label,
  key,
  onClick,
}: {
  label: string;
  key: number;
  onClick: () => void;
}) {
  return (
    <div
      className="w-[100px] h-[50px] border flex items-center justify-center text-center hover:bg-slate-200 hover:text-black cursor-pointer rounded-md font-medium text-sm"
      key={key}
      onClick={onClick}
    >
      {label}
    </div>
  );
}

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title: String;
}) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 bg-gray-800 bg-opacity-90 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between">
          <div className="text-sm">{title}</div>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
};

function PublishWorkflowButton({ onClick }: { onClick: () => void }) {
  return (
    <div
      className="rounded-3xl bg-[#7C3AED] px-4 py-1.5 cursor-pointer hover:bg-[#562EB6] font-medium w-fit mt-2 text-white"
      onClick={onClick}
    >
      Publish
    </div>
  );
}
