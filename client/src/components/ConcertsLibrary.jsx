import { Table, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { TheaterSeats } from './TheaterSeats';

function ConcertsTable(props) {
  const { concerts } = props;
  const [expandedConcertID, setexpandedConcertID] = useState(null);

  const handleToggleSeats = (concertID) => {
    setexpandedConcertID(prevId => prevId === concertID ? null : concertID);
  };

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
                  <ConcertRow 
                      concertData={concert} 
                      key={concert.id}
                      isExpanded={expandedConcertID === concert.id}
                      onToggleSeats={handleToggleSeats} />
              ))}
          </tbody>
      </Table>
  );
}

function ConcertRow(props) {
  const { concertData, isExpanded, onToggleSeats } = props;

  const toggleSeats = () => {
      onToggleSeats(concertData.id);
  };

  return (
      <>
          <tr>
              <td>
                  <p>{concertData.name}</p>
              </td>
              <td>
                  <p>{concertData.theater_name}</p>
              </td>
              <td className="text-center">
                  <Button variant="primary" onClick={toggleSeats}>
                      {isExpanded ? 'Hide seats ▲' : 'Book a seat ▼'}
                  </Button>
              </td>
          </tr>
          {isExpanded && (
              <tr className="bg-danger text-white">
                  <td colSpan="3" className="text-center">
                      <i>Attivo</i>
                  </td>
              </tr>
          )}
      </>
  );
}

export { ConcertsTable };