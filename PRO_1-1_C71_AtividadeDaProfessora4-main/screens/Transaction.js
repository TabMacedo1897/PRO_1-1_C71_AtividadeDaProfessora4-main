// IMPORTAÇÃO DOS COMPONENTES QUE VAMOS USAR
import React, { Component } from "react";
import {View,StyleSheet,TextInput,TouchableOpacity,Text,ImageBackground,Image,Alert,
} from "react-native";
import * as Permissions from "expo-permissions";
import { BarCodeScanner } from "expo-barcode-scanner";
import db from "../config";
import firebase from "firebase";

const bgImage = require("../assets/background2.png");
const appIcon = require("../assets/appIcon.png");
const appName = require("../assets/appName.png");

// CRIAÇÃO DO COMPONENTE TRANSLAÇÃO
export default class TransactionScreen extends Component {
  constructor(props) {
    // criação do componente em seu estado de inicialização
    super(props);
    this.state = {
      bookId: "",
      studentId: "",
      domState: "normal",
      hasCameraPermissions: null,
      scanned: false,
      bookName: "",
      studentName: ""
    };
  }
//função para exibir as permissões para a câmera fazer a leitura do QrCode
  getCameraPermissions = async domState => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);

    this.setState({
      /*status === "granted" é verdadeiro quando o usuário concedeu permissão
          status === "granted" é falso quando o usuário não concedeu a permissão
        */
      hasCameraPermissions: status === "granted",
      domState: domState,
      scanned: false
    });
  };
//Função para fazer a leitura do QrCode
  handleBarCodeScanned = async ({ type, data }) => {
    const { domState } = this.state;

    // se tivermos fazendo a leitura de um livro ele lerá o IF
    if (domState === "bookId") {
      this.setState({
        bookId: data,
        domState: "normal",
        scanned: true
      });
      // se ele estiver fazendo a leitura do estudante ele lerá o else
    } else if (domState === "studentId") {
      this.setState({
        studentId: data,
        domState: "normal",
        scanned: true
      });
    }
  };

  //Função para ler a transação da identicação inicial do aluno, e do livro
  handleTransaction = async () => {
    var { bookId, studentId } = this.state;
    // função assíncrona, que espera ser cumprida uma promessa para que seja executada
    await this.getBookDetails(bookId);
    await this.getStudentDetails(studentId);

    // alterar a coleção "books" do banco de dados que se chama fireStore
    db.collection("books")
      .doc(bookId)
      .get()
      .then(doc => {
        var book = doc.data();
        if (book.is_book_available) {
          var { bookName, studentName } = this.state;
          this.initiateBookIssue(bookId, studentId, bookName, studentName);

           Alert.alert("Livro entregue para o aluno!");
        } else {
          var { bookName, studentName } = this.state;
          this.initiateBookReturn(bookId, studentId, bookName, studentName);


          Alert.alert("Livro retornado à biblioteca!");
        }
      });
  };
//Função para ler a transação das características do livro
  getBookDetails = bookId => {
    bookId = bookId.trim();
    db.collection("books")
      .where("book_id", "==", bookId)
      .get()
      .then(snapshot => {
        snapshot.docs.map(doc => {
          this.setState({
            bookName: doc.data().book_details.book_name
          });
        });
      });
  };
//Função para ler a transação das características do aluno
  getStudentDetails = studentId => {
    studentId = studentId.trim();
    db.collection("students")
      .where("student_id", "==", studentId)
      .get()
      .then(snapshot => {
        snapshot.docs.map(doc => {
          this.setState({
            studentName: doc.data().student_details.student_name
          });
        });
      });
  };
// alterar a função que autoriza a permissão do registro do livro para o aluno
// nessa função o aluno irá ter concedida a permissão para emitir um livro no id de sua carteirinha de estudante

  initiateBookIssue = async (bookId, studentId, bookName, studentName) => {
    //adicionar uma transação
    db.collection("transactions").add({
      // alterar aqui
    });
    //alterar status do livro
    db.collection("books")
      .doc(bookId)
      .update({
        // alterar aqui
      });
    //alterar o número de livros retirados pelo aluno
    db.collection("students")
      .doc(studentId)
      .update({
         // alterar aqui
      });

    // Atualizando o estado local
    this.setState({
       // alterar aqui
    });
  };

  //função principal que renderiza as características na tela do celular
  render() {
    const { bookId, studentId, domState, scanned } = this.state;
    if (domState !== "normal") {
      return (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      );
    }
    return (
        <ImageBackground source={bgImage} style={styles.bgImage}>
          {/* visualização dos icones */}
          <View style={styles.upperContainer}>
            {/* primeiro icone */}
            <Image source={appIcon} style={styles.appIcon} />
            {/* segundo icone */}
            <Image source={appName} style={styles.appName} />
          </View>

          <View style={styles.lowerContainer}>
            <View style={styles.textinputContainer}>
              {/* caixa de texto para conter as informações do livro e um botão para enviar essas informações ao banco de dados */}
              <TextInput
                style={styles.textinput}
                placeholder={"Id do Livro"}
                placeholderTextColor={"#FFFFFF"}
                value={bookId}
                onChangeText={text => this.setState({ bookId: text })}
              />
              {/* fim da primeira caixa de texto */}

              {/* botão para ler o Id do Livro */}
              <TouchableOpacity
                style={styles.scanbutton}
                onPress={() => this.getCameraPermissions("bookId")}
              > 
              {/* título do botão */}
              <Text style={styles.scanbuttonText}>Digitalizar</Text>
              </TouchableOpacity>
            </View>

            {/* caixa de texto para conter as informações do aluno e um botão para enviar essas informações para o banco de dados */}
            <View style={[styles.textinputContainer, { marginTop: 25 }]}>
              <TextInput
                style={styles.textinput}
                placeholder={"Id do Aluno"}
                placeholderTextColor={"#FFFFFF"}
                value={studentId}
                onChangeText={text => this.setState({ studentId: text })}
              />
              {/* botão para ler o id do aluno */}
              <TouchableOpacity
                style={styles.scanbutton}
                onPress={() => this.getCameraPermissions("studentId")}
              >
                 {/* título do botão */}
                <Text style={styles.scanbuttonText}>Digitalizar</Text>
              </TouchableOpacity>
            </View>


            {/* botão para enviar as informações para o banco de dados depois do preenchimento dos dados */}
            <TouchableOpacity
              style={[styles.button, { marginTop: 25 }]}
              onPress={this.handleTransaction}
            >
              <Text style={styles.buttonText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
     
    );
  }
}
//constante para fazer os estilos do aplicativo

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  bgImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center"
  },
  upperContainer: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center"
  },
  appIcon: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginTop: 80
  },
  appName: {
    width: 200,
    height: 80,
    resizeMode: "contain"
  },
  lowerContainer: {
    flex: 0.5,
    alignItems: "center"
  },
  textinputContainer: {
    borderWidth: 2,
    borderRadius: 10,
    flexDirection: "row",
    backgroundColor: "#9DFD24",
    borderColor: "#FFFFFF"
  },
  textinput: {
    width: "57%",
    height: 50,
    padding: 10,
    borderColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 3,
    fontSize: 18,
    backgroundColor: "#5653D4",
    
    color: "#FFFFFF"
  },
  scanbutton: {
    width: 100,
    height: 50,
    backgroundColor: "#9DFD24",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  scanbuttonText: {
    fontSize: 19,
    color: "#0A0101",
  },
  button: {
    width: "43%",
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F48D20",
    borderRadius: 15
  },
  buttonText: {
    fontSize: 24,
    color: "#FFFFFF",
  }
});