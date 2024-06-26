import React from "react";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { Document, Page, pdfjs } from "react-pdf";
import AddPdfLogo from "../../asset/images/pdf-svgrepo-com.png";
import CloseIcon from "@mui/icons-material/Close";
import { LoadingButton } from "@mui/lab";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

export interface AddPdfProps {
  pdf: any;
  loading: boolean;
  setPdf: any;
  setLoading: any;
  pdfRef: any;
}

export const handleChangeInput = (pdfRef, setPdf, setLoading) => {
  setPdf(pdfRef.current!.files[0]);
  setLoading(true);
  setTimeout(() => {
    setLoading(false);
  }, 400);
};

const AddPdf = (props: AddPdfProps) => {
  const { pdf, loading, setPdf, setLoading, pdfRef } = props;

  //start react-pdf package config
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
  //end react-pdf package config

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: 200, margin: "auto" }} mb={4}>
      <Button variant="text" sx={{ width: 200, height: 200 }}>
        <Box sx={{ width: 200, height: 200, overflow: "hidden" }}>
          <Document
            file={pdf}
            noData={<img src={AddPdfLogo} alt="Pdf Logo" width="100%" height="100%" />}
            loading="در حال بارگذاری ..."
            error="فایل PDF بارگیری نشد"
          >
            <Page pageNumber={1} width={200} />
          </Document>
        </Box>
      </Button>
      {pdf && !loading ? (
        <Box component={"span"} sx={{ textAlign: "center" }}>
          <Typography variant="subtitle2" display="inline-block" color="green">
            {pdf.name}
          </Typography>
          <IconButton onClick={() => setPdf("")}>
            <CloseIcon color="error" fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        <LoadingButton
          onClick={() => setPdf("")}
          component="label"
          endIcon={<CloudUploadIcon />}
          loading={loading}
          loadingPosition="end"
          variant="contained"
        >
          <Box component={"span"}>آپلود PDF</Box>
          <input
            accept=".pdf"
            type="file"
            hidden
            ref={pdfRef}
            onChange={() => {handleChangeInput(pdfRef, setPdf, setLoading)}}
          />
        </LoadingButton>
      )}
    </Box>
  );
};

export default AddPdf;
