import { Button, Paper, Slide, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { IoMdAdd } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';

const AdesaoViewsPage = () => {
  const navigate = useNavigate();

  const [onLoad, setOnLoad] = useState(false);


  useEffect(() => {
    setOnLoad(true)
  }, [])

  return (
    <Stack width={"calc(100% - 28px)"}>
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
        my={2}
      >
        <h2 className="text-2xl text-default font-extrabold"></h2>
        <Button
          color="secondary"
          variant="contained"
          endIcon={<IoMdAdd />}
          onClick={() => {
            navigate("/adesao/edit");
          }}
          sx={{ borderRadius: 2 }}
        >
          Adicionar
        </Button>
        <Slide direction="right" in={onLoad} mountOnEnter>
          <Paper
            elevation={0}
            sx={{
              p: 1,
              flexGrow: 1,
              width: "100%",
              height: "calc(100vh - 170px)",
              borderRadius: 4,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                height: "100%",
                overflow: "auto",
                "&::-webkit-scrollbar": {
                  width: "8px",
                  height: "12px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#ddd",
                  borderRadius: "12px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "#EFEFEF",
                },
              }}
            >
            </Paper>
          </Paper>
        </Slide>
      </Stack>
    </Stack>
  )
}

export default AdesaoViewsPage