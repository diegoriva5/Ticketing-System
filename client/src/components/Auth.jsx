import { useState } from 'react';
import { Form, Button, Alert, Col, Row, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function LoginForm(props) {
  const [username, setUsername] = useState('u1@p.it');
  const [password, setPassword] = useState('pwd');

  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();


  const handleSubmit = (event) => {
    event.preventDefault();
    const credentials = { username, password };

    if (!username) {
      setErrorMessage('Username cannot be empty');
    } else if (!password) {
      setErrorMessage('Password cannot be empty');
    } else {
      props.login(credentials)
        .then( () => navigate( "/" ) )
        .catch((err) => { 
          setErrorMessage(err.error || 'Login failed. Please try again'); 
        });
    }
  };

  const handleBack = () => {
    navigate('/');  // Navigate back to the add ticket page with ticket data
  };

  return (
    <Container className="mt-5 p-4 shadow-lg rounded bg-light" style={{ maxWidth: '500px' }}>
      <h1 className="text-center mb-4">Welcome Back!</h1>

      <Form onSubmit={handleSubmit}>
        {errorMessage ? (
          <Alert dismissible onClose={() => setErrorMessage('')} variant="danger">
            {errorMessage}
          </Alert>
        ) : null}

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={username}
            placeholder="Example: john.doe@example.it"
            onChange={(ev) => setUsername(ev.target.value)}
            className="shadow-sm"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            placeholder="Enter your password"
            onChange={(ev) => setPassword(ev.target.value)}
            className="shadow-sm"
          />
        </Form.Group>

        <Row className="mt-4">
          <Col className="d-flex justify-content-start">
            <Button type="submit" variant="primary" className="px-4 py-2 shadow">Login</Button>
          </Col>
          <Col className="d-flex justify-content-end">
            <Button variant="danger" className="px-4 py-2 shadow" onClick={handleBack}>Back to Home</Button>
          </Col>
        </Row>
      </Form>
    </Container>
  )
};

function LogoutButton(props) {
  return (
    <Button variant="outline-light" onClick={props.logout}>Logout</Button>
  )
}

function LoginButton(props) {
  const navigate = useNavigate();
  return (
    <Button variant="outline-light" onClick={()=> navigate('/login')}>
        <i className='bi bi-person me-2'></i>Login</Button>
  )
}

export { LoginForm, LogoutButton, LoginButton };