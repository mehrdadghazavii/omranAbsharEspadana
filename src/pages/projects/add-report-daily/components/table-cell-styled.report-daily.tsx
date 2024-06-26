import {TableCellProps} from "@mui/material/TableCell";
import {styled} from "@mui/material/styles";
import {TableCell} from "@mui/material";

interface CellProps extends TableCellProps {
  active: boolean
}

export const TableCellStyled = styled(TableCell, {
  shouldForwardProp: (prop) => prop !== 'active',
})<CellProps>(({theme, active}) => ({
  backgroundColor: active ? 'rgba(0,255,0,.2)' : 'rgba(255,0,0,.2)',
  maxWidth: 120
}))