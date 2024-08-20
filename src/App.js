import React from 'react';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import project1Image from './pics/AVO15349.JPG';

const SkillSet = () => {
    const skills = [
        'Java', 'Python', 'JavaScript', 'React', 'Vue',
        'Bootstrap', 'HTML', 'CSS', 'SQL', 'GraphQL',
        'C', 'C#', 'VHDL', 'Clash', 'ModelSim'
    ];

    return (
        <div className="skill-set my-5">
            <h1 className="text-left mb-4 text-center" style={{ color: '#003d66' }}>Skills</h1>
            <div className="skills-container" style={{ maxWidth: '60%', margin: 'auto' }}>
                {skills.map(skill => (
                    <span key={skill} className="skill-badge">{skill}</span>
                ))}
            </div>
        </div>
    );
};

const Projects = () => {
    const projects = [
        {
            title: 'Door Opener System',
            description: 'Individual assignment: 10-week Internship assignment at Cofano Software Solutions which included programming of the Atmega328p microcontroller to be able to handle input from several sources as well as edits to an existing C# application on a Raspberry Pi 3B device, additional diagrams of the electrical circuits were made',
            technologies: 'C++, C#, Arduino, Raspberry Pi, RFID',
            image: '/images/internship.jpg',
        },
        {
            title: 'Taking Attendance',
            description: 'Team Project: Attendance taking web application through RFID scanning',
            technologies: 'RFID, Java, JavaScript, HTML, CSS, Bootstrap, SQL',
            image: '/images/taking attendance.jpg',
        },
        {
            title: 'Green Light District',
            description: 'Team Project: Traffic Congestion management system vehicles are detected through speed sensors. Once detected, calculations are made such that LEDs on the side of the road will light up, indicating the speed bikers need to keep in order to cross at a green light',
            technologies: 'Python, HTML, CSS, Bootstrap, Django, Raspberry Pi',
            image: '/images/Green light.jpg',
        },
        {
            title: 'Stay Focused',
            description: 'Team project: Game Development of a Serious game about ADHD where the protagonist exhibits some of the symptoms of the condition',
            technologies: 'Unity 3D, Blender, C#',
            image: '/images/serious.jpg',
        },
        {
            title: 'InterVirtual tours',
            description: 'Team project: Web application for providing Virtual tours of buildings in Google Sheet view style through created a camera in a sphere and an algorithm that stitched photos together to surround the sphere',
            technologies: 'React',
            image: '/images/intervirtual tours.png',
        },
        {
            title: 'InterTerm Klima',
            description: 'Passion project: Building a static website for my fathers air-conditioning business',
            technologies: 'HTML, CSS, JS',
            image: '/images/Interterm klima.png',
        },
        {
            title: 'Trilinguo',
            description: 'Team Project: Language-learning web application for learning Dutch, included interaction with an OpenAI api for practicing dutch speaking',
            technologies: 'React, Bootstrap, OpenAI api',
            image: '/images/trilinguo.jpg',
        },
        {
            title: 'Blowfish Crypto-processor',
            description: 'Team Project: A processor for Blowfish cryptographic operations',
            technologies: 'FPGA, Clash',
            image: '/images/fpga.jpg',
        }
    ];

    return (
        <div className="projects my-5">
            <h1 className="text-left mb-4 text-center" style={{ color: '#003d66' }}>Projects</h1>
            <Container>
                <Row>
                    {projects.map((project, index) => (
                        <Col xs={12} md={6} lg={4} key={index} className="mb-4">
                            <Card>
                                <Card.Img variant="top" src={project.image} className="project-card-img" />
                                <Card.Body>
                                    <Card.Title>{project.title}</Card.Title>
                                    <Card.Text>{project.description}</Card.Text>
                                    <Card.Footer className="text-muted">{project.technologies}</Card.Footer>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </div>
    );
};


export default function App() {
    return (
        <div className={"page"}>
            <div className="cv-background">
                <Container>
                    <Row className="align-items-center" style={{ minHeight: '70vh' }}>
                        <Col xs={12} md={6} className="align-items-center">
                            <h2 className={"text-center mt-5"} style={{ color: '#8585ad' }}>Ren<span style={{ color: '#60607a' }}>e</span>ta Trifonova</h2>
                            <h1 className={"text-center"} style={{ color: '#003d66' }}>Student Developer</h1>
                            <div className="text-center">
                                <a href="/CV%20Reneta%20Trifonova.pdf" download>
                                    <Button style={{
                                        backgroundColor: "#1a88dc",
                                        borderColor: "#1a88dc",
                                        width: '80%',
                                        marginTop: '30px',
                                        borderRadius: '0px',
                                        fontSize: '1.7rem'
                                    }} className={"btn-lg"}>Download CV</Button>
                                </a>
                            </div>
                        </Col>
                        <Col xs={12} md={6} className="my-5 d-flex justify-content-center p-0">
                            <div className="image-placeholder" />
                        </Col>
                    </Row>
                </Container>
                <Container className={"my-5"}>
                    <div className="text-left" style={{ maxWidth: '80%', margin: 'auto' }}>
                        <h1 className="text-left mb-4" style={{ color: '#003d66' }}>About Me</h1>
                        <p style={{ color: '#727281', fontSize: '1.5rem' }}> Hi! My name is Ren<span style={{ color: '#424249' }}>e</span>ta and I am passionate about both Software Development and Embedded Systems. With my academic background in Computer Science, I strive to deliver quality solutions to intricate problems while also having fun. Below you can find more information about me. </p>
                    </div>
                </Container>
                <hr className="hr-style1" />
                <hr className="hr-style2" />
                <Container className={"my-5"}>
                    <div className="text-center">
                        <h1 className="text-center mb-4" style={{color: '#003d66'}}>Education</h1>
                        <h3 style={{color: '#8585ad', display: 'inline'}}>Bsc&nbsp;</h3>
                        <h3 style={{color: '#3c7598', display: 'inline'}}>Technical Computer Science&nbsp;</h3>
                        <h3 style={{color: '#8585ad', display: 'inline'}}> @ University of Twente&nbsp;&nbsp;</h3><br/><br/>
                        <h3 style={{color: '#8585ad', display: 'inline'}}>Msc&nbsp;</h3>
                        <h3 style={{color: '#3c7598', display: 'inline'}}>Embedded Systems&nbsp;</h3>
                        <h3 style={{color: '#8585ad', display: 'inline'}}> @ Eindhoven University of Technology</h3>
                        <h4 style={{color: '#8585ad'}}> (1st year student) </h4>
                    </div>
                </Container>

                <hr className="hr-style1"/>
                <hr className="hr-style2"/>
                <Container className={"my-5"}>
                    <h1 className="text-left mb-4 text-center" style={{color: '#003d66'}}>Experience</h1>
                    <div className={"ml-4 mr-4 "}>
                        <ul className="text-left" style={{ listStyleType: 'disc', paddingLeft: '20px', margin: 'auto', textAlign: 'left', maxWidth: 'fit-content' }}>
                            <li>
                                <h4 style={{ color: '#3c7598' }}>Product and Implementation Engineer @ Cofano Software Solutions&nbsp;</h4>
                                <h5 style={{ color: '#8585ad' }}>July 2022 - June 2023</h5>
                            </li>
                            <li>
                                <h4 style={{ color: '#3c7598' }}>Student Developer @ Cofano Software Solutions&nbsp;</h4>
                                <h5 style={{ color: '#8585ad' }}>July 2023 - May 2024</h5>
                            </li>
                            <li>
                                <h4 style={{ color: '#3c7598' }}>Teaching Assistant @ University of Twente</h4>
                                <h5 style={{ color: '#8585ad' }}>September 2022 - August 2024</h5>
                            </li>
                            <li>
                                <h4 style={{ color: '#3c7598' }}>Student Developer @ EDAcation</h4>
                                <h5 style={{ color: '#8585ad' }}>July 2023 - December 2023</h5>
                            </li>
                        </ul>
                    </div>
                </Container>
                <hr className="hr-style1" />
                <hr className="hr-style2" />
                <Container className={"my-5"}>
                    <SkillSet />
                </Container>
                <hr className="hr-style1" />
                <hr className="hr-style2" />
                <Container className={"my-5"}>
                    <Projects />
                </Container>
                <div className="contact-icons my-5">
                    <h2 className="text-left mb-4 text-center" style={{ color: '#003d66' }}>Contact me:</h2>
                    <a href="https://www.linkedin.com/in/reneta-trifonova" target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={faLinkedin} size="3x" />
                    </a>
                    <a href="mailto:connect@reneta.nl">
                        <FontAwesomeIcon icon={faEnvelope} size="3x" />
                    </a>
                </div>
            </div>
        </div>
    );
}
