export const Inbox = () => {
  return (
    <div className="flex h-full bg-white rounded-lg shadow">
      <div className="w-1/3 border-r border-slate-200">
        <div className="p-4 border-b">
          <h2 className="font-bold">Mensagens</h2>
        </div>
        <div className="overflow-y-auto">
          {/* List of threads */}
          <div className="p-4 hover:bg-slate-50 cursor-pointer">
            <p className="font-bold">João Silva</p>
            <p className="text-sm text-slate-500 truncate">
              Olá, gostaria de saber mais...
            </p>
          </div>
        </div>
      </div>
      <div className="w-2/3 p-4 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Messages */}
          <div className="flex justify-start">
            <div className="bg-slate-100 p-3 rounded-lg max-w-xs">
              <p>Olá, gostaria de saber mais sobre o plano Pro.</p>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-blue-600 text-white p-3 rounded-lg max-w-xs">
              <p>Claro! Nosso plano Pro inclui...</p>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <textarea
            className="w-full border rounded-lg p-2"
            placeholder="Digite sua resposta..."
          />
        </div>
      </div>
    </div>
  );
};
