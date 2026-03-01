import { useState } from "react";
import { Mic, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const ActiveCall = () => {
  const [status, setStatus] = useState("idle"); // idle, dialing, speaking

  if (status === "idle") return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-slate-900 text-white rounded-xl shadow-2xl p-4 border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Chamada Ativa</h3>
        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded uppercase">
          {status}
        </span>
      </div>
      <div className="flex justify-center gap-4">
        <Button variant="secondary" size="icon" className="rounded-full">
          <Mic className="w-5 h-5" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          className="rounded-full"
          onClick={() => setStatus("idle")}
        >
          <PhoneOff className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
