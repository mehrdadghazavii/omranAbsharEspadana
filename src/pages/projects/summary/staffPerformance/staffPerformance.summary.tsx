import React, {useEffect, useState} from 'react';
import {Grid, Paper, TableCell,} from "@mui/material";
import {getStaffSummaryReport} from "api/api";
import {TableProIpa} from "components";
import {useParams} from 'react-router-dom'
import {ColumnPro} from "../../../../components/table-pro/table-pro.component";
import {sortNumbers, sortStrings} from "../../../../utils/sort.utils";


const columns: ColumnPro[] = [
    {
        id: 'counter',
        label: '#',
        align: 'center',
        minWidth: 15,
        state: 0,
        numeric: true,
        show: true,
    },
    {
        id: 'name',
        label: 'نام',
        align: 'left',
        minWidth: 90,
        state: 0,
        numeric: false,
        show: true,
        sort: sortStrings
    },
    {
        id: 'workingHours',
        label: 'جمع ساعت کاری',
        align: 'center',
        minWidth: 30,
        state: 0,
        numeric: true,
        show: true,
        sort: sortNumbers,
        format: (value: string) => value
    },
    {
        id: 'salery',
        label: 'جمع دستمزد',
        align: 'center',
        minWidth: 90,
        state: 0,
        numeric: true,
        show: true,
        sort: sortNumbers,
        format: value => value.toLocaleString("fa-Ir")
    },
];


function StaffPerformanceSummaryPage({startDate, endDate}: any) {
    const [rows, setRows] = useState<any>([])

    useEffect(() => {
        getAllNeedData()
    }, [startDate, endDate])

    const {projectId} = useParams()


    const getAllNeedData = async () => {
        const res: any = await getStaffSummaryReport(projectId, startDate, endDate)

        if (!(res instanceof Error)) {
            setRows(res[1])
        }
    }



    return (
        <Grid container>
            <Grid item xs={12} style={{width: 10}}>
                <Paper>
                    <TableProIpa columns={columns}
                                 bodyFunc={(column, row: any, index) => {
                                     const head = column.id
                                     const value = row[column.id];
                                     return (
                                         <TableCell key={column.id} align={column.align}>
                                             {column.format && value ? column.format(value) : value}
                                         </TableCell>
                                     )
                                 }}
                                 summableColumns={["salery"]}
                                 rows={rows}/>
                </Paper>
            </Grid>
        </Grid>
    );
}

export {StaffPerformanceSummaryPage}