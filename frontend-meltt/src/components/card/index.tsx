import { Stack, Typography } from "@mui/material";
import { ReactNode } from "react";

const CustomCard = ({
  title,
  subtitle,
  children,
  headerActionContent,
  sxProps,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  headerActionContent?: ReactNode;
  sxProps?: any;
}) => {
  return (
    <Stack
      sx={{ p: 0, backgroundColor: "#fff", borderRadius: "12px", ...sxProps }}
    >
      <Stack direction={"column"}>
        <Stack
          pt={4}
          pb={1}
          px={3}
          height={"45px"}
          direction={"row"}
          alignItems={"center"}
          justifyContent={"space-between"}
          borderRadius={"20px 20px 0 0"}
        >
          <Stack direction={"column"}>
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 600,
                color: "#342394",
              }}
            >
              {title}
            </Typography>
            <Typography
              color="textSecondary"
              sx={{ fontSize: 12, fontWeight:'light' }}
            >
              {subtitle}
            </Typography>
          </Stack>
          {headerActionContent}
        </Stack>
        <Stack direction={"column"}>{children}</Stack>
      </Stack>
    </Stack>
  );
};

export default CustomCard;
