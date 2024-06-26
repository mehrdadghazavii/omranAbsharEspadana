import {Pagination} from "@mui/lab";

function PaginationIpa(props: { count: number, page: number, limit: number, onChange: Function }){
  const {count, page, limit, onChange} = props;
  return (
      <Pagination
          color={'primary'}
          onChange={(e, value) => onChange(value)}
          page={page}
          count={Math.ceil(count / limit)}
          defaultPage={limit}/>
  )
}

export {PaginationIpa}