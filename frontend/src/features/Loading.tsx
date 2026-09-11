import { FaSpinner } from "react-icons/fa";

export default function Loading() {
  return (
    <div className="inset-0 fixed flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-lg">
      <FaSpinner className="text-purple-500 text-4xl animate-spin" />
    </div>
  );
}