
const EventDetails = () => {
  return (
    <div className="w-full p-6">
      <h1 className="text-2xl text-primary font-bold">Dashboard</h1>
      <p className="mb-4 text-slate-600">Essa é a página de detalhamento de ingressos.</p>

      {/* Seção Total de Vendas */}
      <div className="w-full flex flex-row items-center justify-between">
        <div className="mb-1 border p-4 rounded-lg shadow-md">
          <h2 className="text-xl text-primary font-semibold mb-2">Total de vendas</h2>
          <p className="text-3xl text-secondary font-bold mb-1">R$ 570,00</p>
          <div className="space-y-1 text-slate-500">
            <p>R$ 570,00 - Pagamentos via plataforma</p>
            <p>R$ 0,00 - Pagamentos em dinheiro</p>
          </div>
        </div>
        {/* Seção Ingressos Emitidos */}
        <div className="mb-1 border p-4 rounded-lg shadow-md">
          <h2 className="text-xl text-primary font-semibold mb-2">Ingressos Emitidos</h2>
          <p className="text-3xl text-secondary font-bold">2</p>
          <p className="mt-2 text-slate-500">2 ingressos vendidos + nenhuma cortesia emitida</p>
        </div>
        {/* Seção Ticket Médio */}
        <div className="mb-1 border p-4 rounded-lg shadow-md">
          <h2 className="text-xl text-primary font-semibold mb-2">Ticket Médio</h2>
          <p className="text-3xl text-secondary font-bold">R$ 300,00</p>
          <p className="text-sm text-slate-500 mt-1">
            Tickets médios de compras confirmadas (Não considera cortesia)
          </p>
        </div>
      </div>

      <hr className="my-4 border-t-2" />

      {/* Seção Todos os Ingressos */}
      <div>
        <h2 className="text-xl text-primary font-bold mb-2">Todos os ingressos</h2>

        <div className="grid grid-cols-3 gap-6 ">
          {/* Tabela Resumo */}
          <div className="bg-gray-50 p-4 shadow-md rounded-lg">
            <h3 className="text-primary font-semibold mb-4">INGRESSOS EMITIDOS</h3>
            <table className="w-full mb-4">
              <tbody>
                <tr className="border-slate-200 border-b">
                  <td className="text-primary">Total em vendas</td>
                  <td className="text-secondary text-right">R$ 570,00</td>
                </tr>
                <tr className="border-slate-200 border-b" >
                  <td className="text-primary">Total em ingressos</td>
                  <td className="text-secondary text-right">+ R$ 600,00</td>
                </tr>
                <tr className="border-slate-200 border-b">
                  <td className="text-primary">Taxas absorvidas</td>
                  <td className="text-secondary text-right">- R$ 30,00</td>
                </tr>
              </tbody>
            </table>

            <table className="w-full">
              <tbody>
                <tr className="border-slate-200 border-b">
                  <td className="text-primary">VENDAS POR ORIGEM</td>
                  <td className="text-secondary text-right">R$ 570,00</td>
                </tr>
                <tr className="border-slate-200 border-b">
                  <td className="text-primary pl-4">Vendas Online</td>
                  <td className="text-secondary text-right">2 ingressos</td>
                </tr>
                <tr className="border-slate-200 border-b">
                  <td className="text-primary pl-4">Online</td>
                  <td className="text-secondary text-right">R$ 570,00</td>
                </tr>
                <tr className="border-slate-200 border-b">
                  <td className="text-primary pl-4">Cartão de Crédito</td>
                  <td className="text-secondary text-right">2 ingressos</td>
                </tr>
                <tr className="border-slate-200 border-b">
                  <td className="text-primary pl-4"></td>
                  <td className="text-secondary text-right">R$ 570,00</td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Tabela Convidados */}
          <div className="bg-gray-50 p-4 shadow-md rounded-lg">
            <table className="w-full">
              <tbody>
                <tr className="border-slate-200 border-b">
                  <td className="text-primary">Convidados</td>
                  <td className="text-primary">2 ingressos</td>
                  <td className="text-secondary text-right">R$ 600,00</td>
                </tr>
                <tr className="border-slate-200 border-b">
                  <td className="text-primary">1º Lote</td>
                  <td className="text-primary">2 ingressos</td>
                  <td className="text-secondary text-right">R$ 600,00</td>
                </tr>
                <tr className="border-slate-200 border-b">
                  <td className="text-primary">Inteira</td>
                  <td className="text-primary">2 x R$ 300,00</td>
                  <td className="text-secondary text-right">R$ 600,00</td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Seção PDV */}
          <div className="bg-gray-50 p-4 shadow-md rounded-lg">
            <table className="w-full">
              <tbody>
                <tr className="border-slate-200 border-b">
                  <td className="text-primary">Vendas Pdv</td>
                  <td className="text-secondary text-right">R$ 0,00</td>
                </tr>
                <tr className="border-slate-200 border-b">
                  <td className="text-primary pl-4">Pdv Ticketeira</td>
                  <td className="text-secondary text-right">R$ 0,00</td>
                </tr>
                <tr className="border-slate-200 border-b">
                  <td className="text-primary pl-4">Pdv Produtor</td>
                  <td className="text-secondary text-right">R$ 0,00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;