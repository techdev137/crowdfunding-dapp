import VerifierCampaign from './components/VerifierCampaign'
import { connect } from 'react-redux'

const mapStateToProps = (state) => {
  return ({
    users: state.users
  })
}

export default connect(mapStateToProps)(VerifierCampaign)
