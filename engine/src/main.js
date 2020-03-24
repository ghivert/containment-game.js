const Engine = params => {
  return new Engine_(params)
}

class Engine_ {
  constructor(options) {
    const { players, state, actions, filter } = options
    this.players = players
    this.state = state
    this.actions = actions
    this.getState = pid => filter(this.state, pid)
  }

  run(action, pid, params) {
    const { players, state, actions } = this
    const player = players.find(({ id }) => id === pid)
    const act = actions[action]
    if (act instanceof Function) {
      this.state = act(state, player, params)
      return this.state
    } else {
      throw new Error(`${action} does not exist as a function.`)
    }
  }
}

export { Engine }
