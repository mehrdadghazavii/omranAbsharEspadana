import React from 'react';
import {
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow
} from "@mui/material";
import moment from "jalali-moment";
import DownloadIcon from "@mui/icons-material/Download";
import {getPaymentFactor} from "../../../api/api";
import Backdrop from "@mui/material/Backdrop";
import {toast} from "react-toastify";
import {BounceLoader} from "react-spinners";


interface Column {
    id: 'cost' | 'duration' | 'purchaseDate' | "refId" | "status" | "download";
    label: string;
    minWidth?: number;
    align?: 'center';
    format?: (value: any) => any;
}

const columns: readonly Column[] = [
    {
        id: 'purchaseDate',
        label: "تاریخ",
        minWidth: 100,
        align: 'center',
    },
    {
        id: 'cost',
        label: 'قیمت',
        minWidth: 50,
        align: 'center',
    },
    {
        id: 'duration',
        label: 'نوع بسته',
        minWidth: 50,
        align: 'center',
    },
    {
        id: 'refId',
        label: 'شماره تراکنش',
        minWidth: 50,
        align: 'center',
    },
    {
        id: 'status',
        label: 'وضعیت تراکنش',
        minWidth: 50,
        align: 'center',
    },
    {
        id: 'download',
        label: 'دانلود',
        minWidth: 20,
        align: 'center',
    },
];

function PaymentsComponent({payments}) {
    const [page, setPage] = React.useState<any>(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [loading, setLoading] = React.useState(false);

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleDownloadFactor = async (paymentId) => {
        setLoading(true);
        const res = await getPaymentFactor(paymentId);
        if (!(res instanceof Error)) {
            const a = document.createElement("a");
            a.target = "_blank";
            a.href = res.toString();
            a.download = res.toString();
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setLoading(false);
        } else {
            setLoading(false);
            toast.error("خطا در دانلود فاکتور !")
        }
    }

    return (
        <Paper sx={{width: '100%', overflow: 'hidden'}}>
            <Backdrop open={loading}>
                <BounceLoader color="#5bd1bf"/>
            </Backdrop>
            <TableContainer sx={{maxHeight: 380}}>
                <Table stickyHeader={!loading} size="small" aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align}
                                    style={{minWidth: column.minWidth, backgroundColor: "#efefef"}}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {payments
                            ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((payment) => {
                                const formattedDate = moment(payment.purchaseDate).locale('fa').format('YYYY/MM/DD');
                                const statusText: string = payment.status === (100 || 101) ? 'موفق' : 'ناموفق';
                                return (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={payment.id}
                                              sx={{
                                                  bgcolor: statusText === "موفق" ? "rgba(184, 255, 187, 0.72)" : "rgba(255, 0, 0, 0.14)",
                                                  ':hover': {backgroundColor: statusText === "موفق" ? 'rgb(184, 255, 187) !important' : 'rgba(255, 0, 0, 0.22) !important'}
                                              }}>
                                        {columns.map((column) => {
                                            return (
                                                <TableCell key={column.id} align={column.align}>
                                                    {column.id === 'purchaseDate' ? formattedDate
                                                        : column.id === 'status' ? statusText
                                                            : column.id === "download" && statusText === "موفق" ?
                                                                <IconButton
                                                                    onClick={() => handleDownloadFactor(payment.id)}>
                                                                    <DownloadIcon/>
                                                                </IconButton>
                                                                :
                                                                payment[column.id]
                                                    }
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>
            {payments?.length > 0 ?
                <TablePagination
                    rowsPerPageOptions={[10, 20, 100]}
                    component="div"
                    count={payments.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(newPage) => setPage(newPage)}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    // disabled
                />
                : null
            }
        </Paper>
    );
}

export default PaymentsComponent;