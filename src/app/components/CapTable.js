import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

export default ({ cap }) => {
  const classes = useStyles();
  if (!cap.valid) {
    return <React.Fragment></React.Fragment>;
  }

  let rs_names = Object.keys(cap.rs);
  rs_names.sort();

  let pp_names = Object.keys(cap.pp);
  pp_names.sort();

  let md_names = Object.keys(cap.md);
  md_names.sort();

  return (
    <React.Fragment>
      <h1>Device capaibilites</h1>
      <TableContainer component={Paper}>
        <Table className={classes.table} size="small">
          <TableHead>
            <TableRow>
              <TableCell>CPU type</TableCell>
              <TableCell>CPU speed [MHz]</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow selected={false}>
              <TableCell>{cap.cpu_type}</TableCell>
              <TableCell>{cap.cpu_speed_mhz}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <h1>Modules available</h1>
      <TableContainer component={Paper}>
        <Table className={classes.table} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Args</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {md_names.map((name) => (
              <TableRow key={name} selected={false}>
                <TableCell>{name}</TableCell>
                <TableCell>
                  {cap.md[name].args
                    .map((a) => a.type + (a.optional ? " (optional)" : ""))
                    .join(", ")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <h1>Peripherals available</h1>
      <TableContainer component={Paper}>
        <Table className={classes.table} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Num args</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pp_names.map((name) => (
              <TableRow key={name} selected={false}>
                <TableCell>{name}</TableCell>
                <TableCell>{cap.pp[name].pp_type}</TableCell>
                <TableCell>{cap.pp[name].num_args}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <h1>Resources available</h1>
      <TableContainer component={Paper}>
        <Table className={classes.table} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Num available</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rs_names.map((name) => (
              <TableRow key={name} selected={false}>
                <TableCell>{name}</TableCell>
                <TableCell>{cap.rs[name].rs_type}</TableCell>
                <TableCell>{cap.rs[name].num_avail}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </React.Fragment>
  );
};
