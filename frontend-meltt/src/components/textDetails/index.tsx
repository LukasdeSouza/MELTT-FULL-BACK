import { Stack, Typography } from "@mui/material";

const TextDetails = ({ text, details }: { text: string; details: string | undefined }) => {
  return (
    <Stack sx={{ fontSize: 14, color: "grey"}} direction={"column"}>
      <Typography variant="body2">
        {text}
      </Typography>
      <Typography sx={{ fontSize: 16, color: "black"}} variant="caption" fontWeight={600}>
        {details}
      </Typography>
    </Stack>
  );
};

export default TextDetails;
