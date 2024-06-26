import React from "react";
import { Box, Button, Divider, IconButton, Typography } from "@mui/material";
import { Document, Page, pdfjs } from "react-pdf";
import EditPdfLogo from "../../asset/images/edit-pdf-logo.png";
import AddPdfLogo from "../../asset/images/pdf-svgrepo-com.png";
import CloseIcon from "@mui/icons-material/Close";
import { LoadingButton } from "@mui/lab";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { handleChangeInput } from "./addPDF.comp";

export interface editPdfProps {
  pdf: any;
  pdfLink: string;
  loading: boolean;
  setPdf: any;
  setLoading: any;
  pdfRef: any;
}

function EditPdf(props: editPdfProps) {
  const { pdf, pdfLink, loading, setPdf, setLoading, pdfRef } = props;

  //start react-pdf package config
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
  //end react-pdf package config

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: 200, margin: "auto" }} mb={4}>
      <Button variant="text">
        <Box sx={{ width: 200, height: 200, overflow: "hidden" }}>
          <Document
            file={pdf}
            noData={
              pdfLink ? (
                <a href={pdfLink} target="_blank" rel="noreferrer">
                  <Typography variant="subtitle2" color="green" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">
                    {pdfLink}
                  </Typography>
                  <Divider variant="fullWidth" />
                  <img src={EditPdfLogo} alt="Pdf Folder Img" width="100%" height="auto" />
                </a>
              ) : (
                <img src={AddPdfLogo} alt="Pdf Folder Img" width="100%" height="auto" />
              )
            }
            loading="در حال بارگذاری ..."
            error="فایل PDF بارگذاری نشد"
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
        <>
          <LoadingButton
            onClick={() => setPdf("")}
            component="label"
            endIcon={<CloudUploadIcon />}
            loading={loading}
            loadingPosition="end"
            variant="contained"
          >
            <Box component={"span"}> {pdfLink ? " تعویض فایل" : "آپلود PDF"}</Box>
            <input
              accept=".pdf"
              type="file"
              hidden
              ref={pdfRef}
              onChange={() => {handleChangeInput(pdfRef, setPdf, setLoading)}}
            />
          </LoadingButton>
        </>
      )}
    </Box>
  );
}

export default EditPdf;
