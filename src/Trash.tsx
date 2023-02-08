import { Droppable } from "react-beautiful-dnd";
import { useAppStoreState } from "./store";

function Trash() {
  const dragging = useAppStoreState((st) => st.dragging);

  return (
    <Droppable droppableId="trash">
      {(provided) => {
        return (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={
              dragging
                ? "fixed-center text-lg text-gray-200 text-center p-[80px] rounded-[20px] leading-[1] bg-red-700 hover:bg-red-600"
                : ""
            }>
            {dragging && (
              <svg
                width="64"
                height="64"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M13.5 6.5V7H18.5V6.5C18.5 5.11929 17.3807 4 16 4C14.6193 4 13.5 5.11929 13.5 6.5ZM11.5 7V6.5C11.5 4.01472 13.5147 2 16 2C18.4853 2 20.5 4.01472 20.5 6.5V7H28C28.5523 7 29 7.44772 29 8C29 8.55228 28.5523 9 28 9H26.4922L24.5988 25.5677C24.3102 28.0931 22.1729 30 19.6311 30H12.3689C9.82714 30 7.68984 28.0931 7.40123 25.5677L5.50778 9H4C3.44772 9 3 8.55228 3 8C3 7.44772 3.44772 7 4 7H11.5ZM9.3883 25.3406C9.56146 26.8558 10.8438 28 12.3689 28H19.6311C21.1562 28 22.4385 26.8558 22.6117 25.3406L24.4792 9H7.5208L9.3883 25.3406ZM13 12.5C13.5523 12.5 14 12.9477 14 13.5V23.5C14 24.0523 13.5523 24.5 13 24.5C12.4477 24.5 12 24.0523 12 23.5V13.5C12 12.9477 12.4477 12.5 13 12.5ZM20 13.5C20 12.9477 19.5523 12.5 19 12.5C18.4477 12.5 18 12.9477 18 13.5V23.5C18 24.0523 18.4477 24.5 19 24.5C19.5523 24.5 20 24.0523 20 23.5V13.5Z"
                  fill="currentColor"
                />
              </svg>
            )}
            {provided.placeholder}
          </div>
        );
      }}
    </Droppable>
  );
}

export { Trash };
