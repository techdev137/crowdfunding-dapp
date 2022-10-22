import React, { Component } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import Campaigns from '../contracts/Campaigns.json';
import { Row, Col, Card, Alert, Button, ProgressBar} from 'react-bootstrap';
import getWeb3 from '../utils/getWeb3';
import TimeFormatter from './utils/TimeFormatter';
import Loading from './utils/Loading';
import Paginator from './utils/Paginator';

class Home extends Component {
  state = {
    numberOfCampaign: 0,
    campaigns: [],
    page: {
      limit: 4,
      firstIndex: 0,
      lastIndex: 0,
    },
    loaded: 0,
    isLoading: false,
    web3: null,
    account: null,
    contract: null
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Campaigns.networks[networkId];
      const instance = new web3.eth.Contract(
        Campaigns.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, account: accounts[0], contract: instance }, this.loadContractInfo);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };


  loadContractInfo = async () => {
    this.setState({ isLoading: true });
    const { account, contract } = this.state;
    const numberOfCampaign = parseInt(await contract.methods.length().call({ from: account }));
    if (numberOfCampaign > 0) {
      const emptyCampaign = [];
      this.setState({ campaigns: emptyCampaign}); //reset campaign
      for (let i = 0; i < numberOfCampaign; i++) {
        this.loadCampaign(i);
      }
      this.setState({ numberOfCampaign });
      //this.updatePagination();
    } else {
      this.setState({ isLoading: false });
    }
  };

  loadCampaign = async (index) => {
    const { account, contract, page } = this.state;
    const campaign = await contract.methods.getInfo(index).call({ from: account });
    let { name, startDate, endDate, goal, collected, owner, finStatus } = campaign;
    let { numberOfCampaign, campaigns, loaded } = this.state;
    finStatus = parseInt(finStatus);
    if (finStatus > 0) {
      collected = parseInt(collected);
      goal = parseInt(goal);
      startDate = parseInt(startDate) * 1000;
      endDate = parseInt(endDate) * 1000;
      const stt = this.getStatus(endDate, goal, collected);
      let statusChr = (['During', 'Failed', 'Succeed'])[stt];
      const progress = this.getProgress(collected, goal);
      campaigns.push({
        id: index,
        name: name,
        start: startDate,
        end: endDate,
        goal: goal,
        collected: collected,
        owner: owner,
        status: statusChr,
        progress: progress
      });
      if (numberOfCampaign !== loaded) {
      this.setState({ campaigns });
      }
    }
    loaded++;
    this.setState({ loaded });
    if (numberOfCampaign === loaded) {
      campaigns.sort((prev, next) => next.start > prev.start);
      this.setState({ campaigns, isLoading: false });
    }
    if (loaded === page.limit || numberOfCampaign === loaded) {
      this.handlePaginator(1);
    }
  };

  getStatus = (deadline, goal, collected) => {
    if (Date.now() < deadline) {
      return 0; //during
    } else {
      if (collected < goal) {
        return 1; //failed
      } else {
        return 2; //succeed
      }
    }
  };

  getProgress = (collected, goal) => {
    const percent = parseInt(collected * 100 / goal);
    let state = 'info';
    if (percent >= 80) {
      state = 'danger';
    } else if (percent >= 60) {
      state = 'warning';
    } else if (percent >= 40) {
      state = 'success';
    }
    return { percent, state };
  };

  listenEventToUpdate = async () => {
    const { contract } = this.state;
    contract.events.allEvents({
      fromBlock: 'latest'
    }, (error, result) => {
      if (error === false && result !== null) {
        this.loadContractInfo(); // update front-end when new event emitted
      }
    });
  };

  handlePaginator = (current) => {
    let {page} = this.state;
    page.lastIndex = current * page.limit;
    page.firstIndex = page.lastIndex - page.limit;
    this.setState({page});
  };

  render() {
    if (!this.state.web3) {
      return <Loading text="Loading web3, account, contract" />;
    }

    const renderCampaigns = this.state.campaigns
      .slice(this.state.page.firstIndex, this.state.page.lastIndex)
      .map((camp, i) =>
        <Col className="pt-1" sm={12} md={12} lg={6} xl={6} key={i}>
          <Card>
            <Card.Header>
              <b><FontAwesomeIcon icon="parachute-box" />
                <Link
                  style={{ color: 'black', fontWeight: 'bold' }}
                  to={`/campaign/${camp.id}`}> {camp.name}</Link></b>
            </Card.Header>
            <Card.Body>
              <Card.Text><b><FontAwesomeIcon icon="user-tie" /> Owner:</b> {camp.owner}</Card.Text>
              <Card.Text><b><FontAwesomeIcon icon="calendar-plus" /> Created: </b>
                <TimeFormatter time={camp.start} />
              </Card.Text>
              <Card.Text><b><FontAwesomeIcon icon="calendar-check" /> Deadline: </b>
                <TimeFormatter time={camp.end} />
              </Card.Text>
              <Card.Text><b><FontAwesomeIcon icon="signal" /> Progress: </b>
                {camp.collected} / {camp.goal} tokens ({camp.status})
         </Card.Text>
              <ProgressBar now={camp.progress.percent} label={`${camp.progress.percent}%`} variant={camp.progress.state} />
            </Card.Body>
          </Card>
        </Col>
      );

    return (
      <div>
        <Row className="pt-1">
          <Col>
            <Alert variant="info" className="mb-0">
              You need fund? <Link to="/create"><Button variant="success"><FontAwesomeIcon icon="plus-circle" /> Start campaign</Button></Link>
            </Alert>
          </Col>
        </Row>
        {this.state.isLoading && <Loading text="Loading campaigns" />}
        <Row className="pt-1">
          <Col>
            <Card>
              <Card.Header><b><FontAwesomeIcon icon="chart-line" /> Campaign List</b></Card.Header>
              <Card.Body className="p-1">
                {
                  (this.state.isLoading === false &&
                    this.state.numberOfCampaign === 0) && (
                    <Alert variant="secondary" className="m-1">Empty list</Alert>
                  )
                }
                <Row>
                  {renderCampaigns}
                </Row>
              </Card.Body>
              {this.state.numberOfCampaign >= this.state.page.limit && (
                <Card.Footer>
                <Paginator 
                numberOfItem={this.state.numberOfCampaign}
                limit={this.state.page.limit}
                callback={this.handlePaginator} />
              </Card.Footer>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Home;