import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Radio from "@material-ui/core/Radio";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData("Frozen yoghurt", 159, 6.0, 24, 4.0),
  createData("Ice cream sandwich", 237, 9.0, 37, 4.3),
  createData("Eclair", 262, 16.0, 24, 6.0),
  createData("Cupcake", 305, 3.7, 67, 4.3),
  createData("Gingerbread", 356, 16.0, 49, 3.9),
];

export default ({ ports, selected, onSelect }) => {
  const classes = useStyles();
  let port_list = Object.values(ports);
  if (selected && !ports[selected]) {
    port_list.push({ path: selected, disconnected: true });
  }

  port_list.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox"></TableCell>
            <TableCell>Port</TableCell>
            <TableCell>Manufacturer</TableCell>
            <TableCell>Vendor/product</TableCell>
            <TableCell>serial#</TableCell>
            <TableCell>location</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow key={-1} selected={selected == null}>
            <TableCell padding="checkbox">
              <Radio
                value={false}
                checked={selected == null}
                onClick={() => onSelect(null)}
              />
            </TableCell>
            <TableCell colSpan={5}>
              Disconnected
            </TableCell>
          </TableRow>
          {port_list.map((p, i) => (
            <TableRow key={i} selected={p.path == selected}>
              <TableCell padding="checkbox">
                <Radio
                  value={p.path}
                  checked={p.path == selected}
                  onClick={() => onSelect(p.path)}
                />
              </TableCell>
              <TableCell component="th" scope="row">
                {p.path}
              </TableCell>
              {p.disconnected ? (
                <React.Fragment>
                  <TableCell colSpan={4} align={"center"}>
                    currently not available
                  </TableCell>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <TableCell>{p.manufacturer || ""}</TableCell>
                  <TableCell>
                    {p.vendorId ? p.vendorId + ":" + p.productId : ""}
                  </TableCell>
                  <TableCell>{p.serialNumber || ""}</TableCell>
                  <TableCell>{p.locationId || ""}</TableCell>
                </React.Fragment>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};