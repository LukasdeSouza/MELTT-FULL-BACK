import dayjs, { Dayjs } from "dayjs";

export type FormikStudentsInitialValues = {
    [key: string]: string | number | Dayjs | undefined;
    nome: string | undefined;
    turma: string | undefined;
    escola: string | undefined;
    educacao_basica: string | undefined;
    data_aniversario: Dayjs | undefined | undefined;
    nome_pai: string | undefined;
    nome_mae: string | undefined;
    whatsapp_pai: string | undefined;
    whatsapp_mae: string | undefined;
    consegue_esperar: number | undefined;
    faz_necessario: number | undefined;
    cumpre_ordens: number | undefined;
    lembra_orientacoes: number | undefined;
    lembra_atividade: number | undefined;
    ajuste_mudancas: number | undefined;
    recuperacao_rapida: number | undefined;
    compartilha_brinquedos: number | undefined;
    mudar_brincadeira: number | undefined;
    gosta_de_fazer: string | undefined;
    animal_preferido: string | undefined;
    personagem_preferido: string | undefined;
    cor_preferido: string | undefined;
    tipo_aprendizagem: string | undefined;
    tipo_aprendizagem_0: string | undefined;
    tipo_aprendizagem_1: string | undefined;
    tipo_aprendizagem_2: string | undefined;
    tipo_aprendizagem_3: string | undefined;
    tipo_aprendizagem_4: string | undefined;
    tipo_aprendizagem_5: string | undefined;
    tipo_aprendizagem_6: string | undefined;
    tipo_aprendizagem_7: string | undefined;
    tipo_aprendizagem_8: string | undefined;
    pei: string | undefined;
    suggestions_material_apoio: string | undefined,
    suggestions_atividades: string | undefined,
    suggestions_estrutura_atividades: string | undefined
    suggestions_recursos_atividades: string | undefined,
    suggestions_recursos_apoio: string | undefined,
    suggestions_recursos_ludicos: string | undefined,
    assunto_gosta_de_falar: string | undefined,
    fica_contente_quando: string | undefined,
    fica_preocupado_quando: string | undefined,
    professor: string | undefined,
}

export type FormikSugestionsInitialValues = {
    [key: string]: string[] | undefined;
    suggestions_atividades: string[];
}

export const initialStudentValues: FormikStudentsInitialValues = {
    nome: undefined,
    turma: undefined,
    escola: undefined,
    educacao_basica: undefined,
    data_aniversario: dayjs(),
    nome_pai: undefined,
    nome_mae: undefined,
    whatsapp_pai: undefined,
    whatsapp_mae: undefined,
    compartilha_brinques: 0,
    consegue_esperar: 0,
    faz_necessario: 0,
    cumpre_ordens: 0,
    lembra_orientacoes: 0,
    lembra_atividade: 0,
    ajuste_mudancas: 0,
    recuperacao_rapida: 0,
    compartilha_brinquedos: 0,
    mudar_brincadeira: 0,
    gosta_de_fazer: undefined,
    animal_preferido: undefined,
    personagem_preferido: undefined,
    cor_preferido: undefined,
    tipo_aprendizagem: undefined,
    tipo_aprendizagem_0: undefined,
    tipo_aprendizagem_1: undefined,
    tipo_aprendizagem_2: undefined,
    tipo_aprendizagem_3: undefined,
    tipo_aprendizagem_4: undefined,
    tipo_aprendizagem_5: undefined,
    tipo_aprendizagem_6: undefined,
    tipo_aprendizagem_7: undefined,
    tipo_aprendizagem_8: undefined,
    pei: undefined,
    suggestions_atividades: undefined,
    suggestions_estrutura_atividades: undefined,
    suggestions_material_apoio: undefined,
    suggestions_recursos_atividades: undefined,
    suggestions_recursos_apoio: undefined,
    suggestions_recursos_ludicos: undefined,
    assunto_gosta_de_falar: undefined,
    fica_contente_quando: undefined,
    fica_preocupado_quando: undefined,
    professor: undefined,
}

export const suggestionValues: FormikSugestionsInitialValues = {
    suggestions_atividades: [""],
}