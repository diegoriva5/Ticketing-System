import { Table, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function ConcertsTable(props) {
    const { concerts } = props;
  
    return (
      <Table className="table table-bordered table-striped table-hover w-100">
        <thead>
          <tr>
            <th className="text-center">Concert</th>
            <th className="text-center">Theater</th>
          </tr>
        </thead>
        <tbody>
          {concerts.map((concert) => (
            <ConcertRow concertData={concert} key={concert.id} />
            ))}
        </tbody>
      </Table>
    );
}
  
function ConcertRow(props) {
  
    const { concertData } = props;
  
    return (
      <tr>
        <td>
          <p>{concertData.name}</p>
        </td>
        <td>
          <p>{concertData.theater_name}</p>
        </td>
      </tr>
    );
}
  
export { ConcertsTable };