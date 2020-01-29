/* eslint-disable react/no-did-update-set-state */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  FaSpinner,
  FaArrowAltCircleLeft,
  FaArrowAltCircleRight,
} from 'react-icons/fa';
import { Loading, Owner, IssueList, Select } from './styles';
import Container from '../../components/Container';

import api from '../../services/api';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    issueStates: ['open', 'closed', 'all'],
    issueState: '',
  };

  async componentDidMount() {
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          per_page: 5,
          state: 'open',
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  async componentDidUpdate(_, prevState) {
    const { issueState } = this.state;

    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);

    if (prevState.issueState !== issueState) {
      const newIssues = await api.get(`/repos/${repoName}/issues`, {
        params: {
          per_page: issueState === 'all' ? 10 : 5,
          state: issueState,
        },
      });

      this.setState({ issues: newIssues.data });
    }
  }

  handleSelectChange = e => {
    this.setState({ issueState: e.target.value });
  };

  render() {
    const { repository, issues, loading, issueStates } = this.state;

    if (loading) {
      return (
        <Loading loading={loading}>
          <FaSpinner size="25" color="#fff" />;
        </Loading>
      );
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>

          {issues.length !== 0 && (
            <p>
              <Select onChange={this.handleSelectChange}>
                {issueStates.map(state => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </Select>
            </p>
          )}
        </Owner>

        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}

          <li>
            <FaArrowAltCircleLeft />
            <FaArrowAltCircleRight />
          </li>
        </IssueList>
      </Container>
    );
  }
}
