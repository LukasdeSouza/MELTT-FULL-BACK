import { Button, Stack, Typography } from "@mui/material";
import { IoAdd } from "react-icons/io5";

const NoTableData = ({
  pronoum,
  pageName,
  disabledButton,
  onClickAction,
}: {
  pronoum: "she" | "he";
  pageName: string;
  disabledButton: boolean;
  onClickAction: () => void;
}) => {
  return (
    <Stack
      width={"100%"}
      height={"100%"}
      alignItems={"center"}
      justifyContent={"center"}
    >
      <Stack direction={"row"} alignItems={"center"}>
        <Stack direction={"column"} width={"320px"} gap={2}>
          <Typography variant="caption" color="textSecondary">
            {pronoum == "she" ? "Nenhuma" : "Nenhum"} {pageName}{" "}
            {pronoum == "she" ? "cadastrada" : "cadastrado"} ainda! Comece agora
            e cadastre {pronoum == "she" ? "a sua primeira" : "o seu primeiro"}{" "}
            {pageName}.
          </Typography>
          {!disabledButton && (
            <Button
              color="secondary"
              variant="contained"
              size="small"
              endIcon={<IoAdd className="text-white" />}
              onClick={onClickAction}
              sx={{
                borderRadius: 2,
                fontFamily: "Poppins",
              }}
            >
              Cadastrar
            </Button>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default NoTableData;
