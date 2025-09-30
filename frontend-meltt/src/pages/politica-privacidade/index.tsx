
import { useState } from 'react';
import { Box, Typography, Checkbox, FormControlLabel, Button, Stack, Paper } from '@mui/material';

const PoliticaPrivacidadePage = () => {
	const [marketingConsent, setMarketingConsent] = useState(false);
	const [accepted, setAccepted] = useState(false);

	const handleAccept = () => {
		// Aqui você pode registrar o consentimento no backend ou localStorage
		setAccepted(true);
		// Exemplo: apiPostData('academic', '/consentimento', { marketingConsent })
	};

	return (
		<Box sx={{ maxWidth: 800, mx: 'auto', my: 6, p: { xs: 2, md: 4 } }}>
			<Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
				<Typography variant="h4" fontWeight={700} mb={2} color="primary">
					Termo de Consentimento e Política de Privacidade
				</Typography>
				<Typography mb={2}>
					Ao utilizar nossos serviços e fornecer seus dados pessoais, você deverá ler e aceitar os termos abaixo, que explicamos de forma clara e transparente.
				</Typography>

				<Typography variant="h6" mt={3} mb={1}>1. Controlador dos Dados</Typography>
				<Typography mb={2}>
					O controlador responsável pelo tratamento de seus dados pessoais é <strong>Meltt formaturas LTDA</strong>, CNPJ 17.615.031/0001-50, domiciliada na Rua Izzat Bussuan, 2395, Vila Aurora, CEP 70824-150, Dourados/MS.
				</Typography>

				<Typography variant="h6" mt={3} mb={1}>2. Finalidades e Bases Legais do Tratamento</Typography>
				<Typography mb={1}>
					Os dados pessoais por nós coletados, incluindo, mas não se limitando a, nome, CPF, e-mail e informações sobre a turma de faculdade, serão utilizados com as seguintes finalidades e bases legais:
				</Typography>
				<ul style={{ marginBottom: 16 }}>
					<li><strong>Gerenciamento do processo de inscrição e execução contratual:</strong> Para viabilizar sua participação na turma e formatura, incluindo o envio de contratos de pré-adesão e adesão. <em>(Base legal: Execução de contrato e obrigações legais).</em></li>
					<li><strong>Comunicação sobre eventos e atividades:</strong> Para enviar informações essenciais sobre eventos, pré-eventos e atividades relacionadas à sua formatura. <em>(Base legal: Execução de contrato e legítimo interesse).</em></li>
					<li><strong>Comunicações de Marketing:</strong> Para enviar ofertas, novidades e conteúdos promocionais relacionados a formaturas e eventos. <em>(Base legal: Consentimento).</em></li>
				</ul>

				<FormControlLabel
					control={<Checkbox checked={marketingConsent} onChange={e => setMarketingConsent(e.target.checked)} color="primary" />}
					label="SIM, eu concordo em receber comunicações de marketing."
					sx={{ mb: 3 }}
				/>

				<Typography variant="h6" mt={3} mb={1}>3. Compartilhamento de Dados</Typography>
				<Typography mb={2}>
					Seus dados poderão ser compartilhados com prestadores de serviços terceirizados (operadores) que nos auxiliam em nossas atividades, como empresas de hospedagem de dados em nuvem (AWS, Railway e Supabase), plataformas de comunicação e sistemas de gestão de eventos, sempre sob rígidos contratos de confidencialidade e segurança, que garantem a proteção de seus dados.
				</Typography>

				<Typography variant="h6" mt={3} mb={1}>4. Prazo de Armazenamento dos Dados</Typography>
				<Typography mb={2}>
					Seus dados pessoais serão armazenados pelo período necessário para cumprir as finalidades descritas neste termo, respeitando o prazo de prescrição de eventuais obrigações legais (como as previstas na legislação consumerista e tributária), ou até que você solicite sua eliminação, desde que não haja qualquer outro fundamento legal que exija a sua manutenção.
				</Typography>

				<Typography variant="h6" mt={3} mb={1}>5. Seus Direitos como Titular</Typography>
				<Typography mb={1}>
					De acordo com a Lei Geral de Proteção de Dados (LGPD - Lei n° 13.709/18), você tem o direito de:
				</Typography>
				<ul style={{ marginBottom: 16 }}>
					<li>Acessar todos os dados pessoais que tratamos sobre você;</li>
					<li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
					<li>Solicitar a portabilidade de seus dados para outro fornecedor de serviço;</li>
					<li>Eliminar dados tratados com base no seu consentimento;</li>
					<li>Revogar o seu consentimento, a qualquer momento;</li>
					<li>Informar-se sobre com quem compartilhamos seus dados e por quanto tempo os armazenamos.</li>
				</ul>

				<Typography variant="h6" mt={3} mb={1}>6. Como Exercer Seus Direitos e Contatar nosso Encarregado</Typography>
				<Typography mb={2}>
					Para exercer qualquer um dos direitos listados acima, ou sanar dúvidas relacionadas ao tratamento de seus dados, você pode entrar em contato com nosso Encarregado pelo Proteção de Dados (DPO) através dos canais específicos:
				</Typography>
				<ul style={{ marginBottom: 16 }}>
					<li><strong>E-mail:</strong> douglas@meltt.com.br</li>
					<li><strong>Endereço Postal:</strong> Rua Izzat Bussuan, 2395, Vila Aurora, CEP 70824-150, Dourados/MS.</li>
				</ul>
				<Typography mb={2}>
					Para garantir sua segurança, poderemos solicitar informações adicionais para confirmar sua identidade antes de processar sua solicitação.
				</Typography>

				<Typography variant="h6" mt={3} mb={1}>7. Manifestação do Aceite</Typography>
				<Typography mb={2}>
					Ao clicar em "Li e Aceito os Termos", abaixo, você declara, de forma livre, informada e inequívoca, que leu e compreendeu todos os termos aqui descritos e concorda com o tratamento de seus dados pessoais para as finalidades delineadas, podendo revogar seu consentimento a qualquer tempo através dos canais indicados.
				</Typography>

				<Stack direction="row" justifyContent="flex-end" mt={4}>
					<Button
						id="accept-button"
						variant="contained"
						color="primary"
						size="large"
						onClick={handleAccept}
						disabled={accepted}
						sx={{ borderRadius: 2, minWidth: 200 }}
					>
						Li e Aceito os Termos
					</Button>
				</Stack>
				{accepted && (
					<Typography color="success.main" mt={3} fontWeight={600}>
						Obrigado! Seu consentimento foi registrado.
					</Typography>
				)}
			</Paper>
		</Box>
	);
};

export default PoliticaPrivacidadePage;
