import { LuNetwork, LuPartyPopper } from "react-icons/lu";
import { FaChartSimple, FaGraduationCap, FaMoneyBill1Wave, FaRegHandshake, FaUsers } from "react-icons/fa6";
import { FaCircle } from "react-icons/fa";
import { BiSupport } from "react-icons/bi";
import { IoContract } from "react-icons/io5";
import { MdBookmarkAdded, MdEmojiEvents, MdOutlinePayments } from "react-icons/md";
import { HiDocumentCheck } from "react-icons/hi2";

export const menuListAdmin = [
  {
    title: "Pré-Contratos",
    route: '/pre-contratos',
    icon: <IoContract />
  },
  {
    title: "Adesões",
    route: "/adesoes",
    icon: <MdBookmarkAdded size={22} />,
  },
  {
    title: "Tarefas",
    route: "/tarefas",
    icon: <LuNetwork size={22} />,
  },
  {
    title: "Turmas",
    route: "/turmas",
    icon: <FaGraduationCap size={22} />,
  },
  {
    title: "Planos Formatura",
    route: "/planos-formatura",
    icon: <FaGraduationCap size={22} />,
  },
  {
    title: "Usuários",
    route: "/usuarios",
    icon: <FaUsers size={22} />,
  },
  {
    title: "Pagamentos",
    route: "/pagamentos",
    icon: <MdOutlinePayments size={22} />,
  },
  {
    title: "Eventos",
    route: "/eventos",
    icon: <MdEmojiEvents size={22} />,
    subRoutes: [
      {title: "Fornecedores", route: "/fornecedores/servico", icon: <FaCircle size={8} className="text-white" />},
    ]
  },
  // {
  //   title: "Contratos e eventos",
  //   route: "/fornecedores",
  //   icon: <MdEmojiEvents size={22} />,
  // },
  {
    title: "Fornecedores",
    route: "/fornecedores",
    icon: <FaRegHandshake size={22} />,
  },
  {
    title: "Relatórios",
    route: "/dashboard",
    icon: <FaChartSimple size={22} />,
    subRoutes: [
      { title: "Fornecedores", route: "/dashboard/fornecedor", icon: <FaCircle size={8} className="text-white" /> },
    ],
  },
  // {
  //   title: "Pagamentos",
  //   route: "/pagamentos",
  //   icon: <FaMoneyBill1Wave size={22} />,
  // },
  // {
  //   title: "Eventos",
  //   route: "/eventos",
  //   icon: <BiSolidParty size={22} />,
  // },
  // {
  //   title: "Contratos",
  //   route: "/contratos-envio",
  //   icon: <FaFileSignature size={22} />,
  // },
];

export const menuListAssociacao = [
  {
    title: "Contratos",
    route: "/contratos",
    icon: <FaGraduationCap size={22} />,
  },
  {
    title: "Suporte",
    route: "/suporte",
    icon: <BiSupport size={22} />,
  },
];


export const menuListAluno = [
  {
    title: "Minha Turma",
    route: "/turmas",
    icon: <FaGraduationCap size={22} />,
  },
  {
    title: "Pagamentos",
    route: "/pagamentos",
    icon: <FaMoneyBill1Wave size={22} />,
  },
  {
    title: "Eventos",
    route: "/eventos",
    icon: <LuPartyPopper size={22} />,
  },
  {
    title: "Estatuto",
    route: "/estatuto",
    icon: <HiDocumentCheck size={22} />,
  }
];


export const listStudentsDrawerNavigation = [
  { key: "cadastro", label: "Cadastro" },
  { key: "preferencias", label: "Preferências e Interesses" },
  { key: "sensorial", label: "Teste de predominância Sensorial" },
  { key: "executiva", label: "Função Executiva" },
  { key: "atividades", label: "Atividades" },
];


export const UFList = [
  { key: 'AC', value: 'AC', label: 'Acre' },
  { key: 'AL', value: 'AL', label: 'Alagoas' },
  { key: 'AP', value: 'AP', label: 'Amapá' },
  { key: 'AM', value: 'AM', label: 'Amazonas' },
  { key: 'BA', value: 'BA', label: 'Bahia' },
  { key: 'CE', value: 'CE', label: 'Ceará' },
  { key: 'DF', value: 'DF', label: 'Distrito Federal' },
  { key: 'ES', value: 'ES', label: 'Espírito Santo' },
  { key: 'GO', value: 'GO', label: 'Goiás' },
  { key: 'MA', value: 'MA', label: 'Maranhão' },
  { key: 'MT', value: 'MT', label: 'Mato Grosso' },
  { key: 'MS', value: 'MS', label: 'Mato Grosso do Sul' },
  { key: 'MG', value: 'MG', label: 'Minas Gerais' },
  { key: 'PA', value: 'PA', label: 'Pará' },
  { key: 'PB', value: 'PB', label: 'Paraíba' },
  { key: 'PR', value: 'PR', label: 'Paraná' },
  { key: 'PE', value: 'PE', label: 'Pernambuco' },
  { key: 'PI', value: 'PI', label: 'Piauí' },
  { key: 'RJ', value: 'RJ', label: 'Rio de Janeiro' },
  { key: 'RN', value: 'RN', label: 'Rio Grande do Norte' },
  { key: 'RS', value: 'RS', label: 'Rio Grande do Sul' },
  { key: 'RO', value: 'RO', label: 'Rondônia' },
  { key: 'RR', value: 'RR', label: 'Roraima' },
  { key: 'SC', value: 'SC', label: 'Santa Catarina' },
  { key: 'SP', value: 'SP', label: 'São Paulo' },
  { key: 'SE', value: 'SE', label: 'Sergipe' },
  { key: 'TO', value: 'TO', label: 'Tocantins' }
]

export const profileAvatarImages = [
  {
    url: "https://img.freepik.com/vetores-premium/icones-de-avatar-de-pessoas-personagens-de-ilustracao-vetorial-para-midias-sociais-e-redes-perfil-de-usuario_770455-14.jpg",
  },
  {
    url: "https://img.freepik.com/vetores-premium/icones-de-avatar-de-pessoas-personagens-de-ilustracao-vetorial-para-midias-sociais-e-redes-perfil-de-usuario_770455-32.jpg"
  },
  {
    url: "https://img.freepik.com/vetores-premium/icones-de-avatar-de-pessoas-personagens-de-ilustracao-vetorial-para-midias-sociais-e-redes-perfil-de-usuario_770455-25.jpg"
  },
  {
    url: "https://img.freepik.com/vetores-premium/icones-de-avatar-de-pessoas-personagens-de-ilustracao-vetorial-para-midias-sociais-e-redes-perfil-de-usuario_770455-9.jpg"
  },
  {
    url: "https://img.freepik.com/vetores-premium/icones-de-avatar-de-pessoas-personagens-de-ilustracao-vetorial-para-midias-sociais-e-redes-perfil-de-usuario_770455-33.jpg"
  },
  {
    url: "https://img.freepik.com/vetores-premium/icones-de-avatar-de-pessoas-personagens-de-ilustracao-vetorial-para-midias-sociais-e-redes-perfil-de-usuario_770455-17.jpg"
  },
  {
    url: "https://media.licdn.com/dms/image/v2/C4D0BAQGHK2vhhHiVfQ/company-logo_200_200/company-logo_200_200/0/1678893040439/meltt_formaturas_logo?e=2147483647&v=beta&t=HbKS2BEqaCTDQL4JYmNDwzxD0OH-tS1wNYau8TDjrjw"
  }
]

export const graduationYearsList = [
  {
    value: "2025",
    label: "2025"
  },
  {
    value: "2026",
    label: "2026"
  },
  {
    value: "2027",
    label: "2027"
  },
  {
    value: "2028",
    label: "2028"
  },
  {
    value: "2029",
    label: "2029"
  },
  {
    value: "2030",
    label: "2030"
  },
  {
    value: "2031",
    label: "2031"
  },
  {
    value: "2032",
    label: "2032"
  },
  {
    value: "2033",
    label: "2033"
  },
  {
    value: "2034",
    label: "2034"
  },
  {
    value: "2035",
    label: "2035"
  },
  {
    value: "2036",
    label: "2036"
  },
  {
    value: "2037",
    label: "2037"
  },
  {
    value: "2038",
    label: "2038"
  },
  {
    value: "2039",
    label: "2039"
  }
]