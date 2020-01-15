import React, { Component } from 'react';
import socket from 'socket.io-client';
import { formatDistanceToNow, parseISO } from 'date-fns';
import Dropzone from 'react-dropzone';
import pt from 'date-fns/locale/pt-BR';
import logo from './../../assets/logo.svg';
import { MdInsertDriveFile } from 'react-icons/md';
import api from './../../service/api';
import './styles.css';

export default class Box extends Component {

    state = {
        box: {}
    };
    async componentDidMount() {
        this.subcribesToNewFiles();
        const box = this.props.match.params.id;

        const response = await api.get(`/boxes/${box}`);

        this.setState({ box: response.data });
    }

    subcribesToNewFiles = () => {
        const box = this.props.match.params.id;

        /**Conecta ao websocket criado no backend */
        const io = socket('http://localhost:3333');

        /**Entra na sala 'connectRoom ' que tem o id box */
        io.emit('connectRoom', box);

        /**Recebe o arquivo criado no backend via socketio */
        io.on('file', data => {
            this.setState({ box: { ...this.state.box, files: [data, ...this.state.box.files] } })
        });
    }
    handleUpload = (files) => {
        files.forEach(file => {
            const box = this.props.match.params.id;
            const data = new FormData();

            data.append('file', file);

            api.post(`/boxes/${box}/files`, data);

        });

    }
    render() {
        return (
            <div id="box-container">
                <header>
                    <img src={logo} alt="logo" />
                    <h1>{this.state.box.title}</h1>
                </header>
                <Dropzone onDropAccepted={this.handleUpload}>
                    {
                        ({ getRootProps, getInputProps }) => (
                            <div className="upload" {...getRootProps()}>
                                <input {...getInputProps()} />
                                <p>Arrate arquivos ou click aqui</p>
                            </div>
                        )
                    }
                </Dropzone>
                <ul>
                    {this.state.box.files && this.state.box.files.map(file => (
                        <li key={file._id}>
                            <a className="fileInfo" href={file.url} target="_blank" >
                                <MdInsertDriveFile size={24} color="#a5cfff" />
                                <strong>{file.title}</strong>
                            </a>
                            <span>{`Criado a ${formatDistanceToNow(parseISO(file.createdAt), { locale: pt })}`}</span>
                        </li>
                    ))
                    }


                </ul>
            </div>
        );
    }
}
