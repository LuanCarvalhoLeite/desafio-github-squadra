import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import { favoritarAction, removerFavoritoAction } from "./store/actions/commonActions";
import { Button, Card, Col, Form, Input, List, Row, Select, Tabs } from "antd";
import { useState } from "react";
import axios from "axios";
import { FaRegHeart, FaHeart } from "react-icons/fa";

const endpoint = "https://api.github.com";
const { TabPane } = Tabs;

function App() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [t, setT] = useState("");

  const dispatch = useDispatch();
  const { favoritos } = useSelector((s) => s.common);

  async function search(query, tipo, per_page = 30, page = 1) {
    setLoading(true);
    console.log(tipo)
    
    if (tipo === "repositories") {
      const res = await axios.get(`${endpoint}/search/${tipo}?q=topic:${query}&per_page=${per_page}&page=${page}`);
      if (res.status === 200) {
        console.log(`${endpoint}/search/${tipo}?q=topic:${query}&per_page=${per_page}&page=${page}`);
        console.log(res.data);
        setList(res.data.items);
        setTotalCount(res.data.total_count);
      }
    }
    if (tipo === "users") {
      const res = await axios.get(`${endpoint}/search/${tipo}?q=${query}&per_page=${per_page}&page=${page}`);
      if (res.status === 200) {
        console.log(`${endpoint}/search/${tipo}?q=${query}&per_page=${per_page}&page=${page}`);
        console.log(res.data);
        setList(res.data.items);
        setTotalCount(res.data.total_count);
      }
    }
    setLoading(false);
  }

  async function onFinish(values) {
    search(values.query, values.tipo);
    setQ(values.query);
    setT(values.tipo)
  }

  function changePage(page, pageSize) {
    console.log(q, t, pageSize, page)
    search(q, t, pageSize, page);
  }

  function favoritar(repository) {
    dispatch(favoritarAction(repository));
  }

  function removerFavorito(repository) {
    dispatch(removerFavoritoAction(repository));
  }

  const itemCard = (item) => {
    return (
      <Card
        actions={[
          favoritos.find((it) => it.id === item.id) ? (
            <FaHeart onClick={() => removerFavorito(item)} />
          ) : (
            <FaRegHeart onClick={() => favoritar(item)} />
          ),
        ]}
        cover={<img alt="example" src={item.owner ? item.owner.avatar_url : item.avatar_url} />}
      >
        <h3>
          <a href={item.html_url} target="_blank">
            {item.name}
          </a>
        </h3>
        <p>
          <a href={item.owner ? item.owner.html_url : item.html_url } target="_blank">
            {item.owner ? item.owner.login : item.login}
          </a>
        </p>
      </Card>
    );
  };

  return (
    <div className="App">
      <Tabs defaultActiveKey="1" type="card">
        <TabPane tab="Buscar" key="1">
          <Form onFinish={onFinish} form={form}>
            <Row gutter={16}>
              <Col sm={4}>
                <Form.Item name="tipo">
                  <Select placeholder="Selecione">
                    <Select.Option value="repositories">Reposit??rio</Select.Option>
                    <Select.Option value="users">Usu??rio</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col sm={16}>
                <Form.Item name="query" rules={[{ required: true, message: "Campo Obrigat??rio" }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col sm={4}>
                <Button loading={loading} htmlType="submit">
                  Buscar
                </Button>
              </Col>
            </Row>
          </Form>
          <List
            loading={loading}
            grid={{ gutter: 16, column: 6 }}
            dataSource={list}
            pagination={{
              total: totalCount,
              pageSize: 30,
              onChange: changePage,
            }}
            renderItem={(item) => <List.Item>{itemCard(item)}</List.Item>}
          />
        </TabPane>
        <TabPane tab={`Favoritos (${favoritos.length})`} key="2">
          <List
            loading={loading}
            grid={{ gutter: 16, column: 6 }}
            dataSource={favoritos}
            renderItem={(item) => <List.Item>{itemCard(item)}</List.Item>}
          />
        </TabPane>
      </Tabs>
    </div>
  );
}

export default App;