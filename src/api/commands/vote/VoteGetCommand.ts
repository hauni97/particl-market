import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { VoteService } from '../../services/VoteService';
import { ProfileService } from '../../services/ProfileService';
import { ProposalService } from '../../services/ProposalService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Vote } from '../../models/Vote';
import { RpcCommandInterface } from './../RpcCommandInterface';
import { Commands } from './../CommandEnumType';
import { BaseCommand } from './../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { MessageException } from '../../exceptions/MessageException';

export class VoteGetCommand extends BaseCommand implements RpcCommandInterface<Vote> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.VoteService) public voteService: VoteService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.ProposalService) public proposalService: ProposalService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.VOTE_GET);
        this.log = new Logger(__filename);
    }

    /**
     * command description
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<any> {
        if (data.params.length < 2) {
            throw new MessageException('Expected <TODO> but recieved no params.');
        }

        // Get profile address from profile id
        const profileId = data.params.shift();
        const profile = await this.profileService.findOne(profileId);
        if (!profile) {
            throw new MessageException(`Couldn't find profile with profile id ${profileId}.`);
        }
        const profileAddr = profile.Address;
        if (!profileAddr) {
            throw new MessageException(`Couldn't find profile address with in profile with id ${profileId}.`);
        }

        // Get proposal id from proposal hash
        const proposalHash = data.params.shift();
        const proposal = await this.proposalService.findOneByHash(proposalHash);
        if (!proposal) {
            throw new MessageException(`Couldn't find proposal with proposal hash ${proposalHash}.`);
        }
        const proposalId = proposal.id;
        if (!proposalId) {
            throw new MessageException(`Couldn't find proposal ud with in proposal with hash ${proposalHash}.`);
        }
        return await this.voteService.findOneByVoterAndProposal(profileAddr, proposalId);
    }

    public help(): string {
        return this.getName() + ' TODO: (command param help)';
    }

    public description(): string {
        return 'Commands for managing VoteVoteGetCommand.';
    }

    public example(): string {
        return this.getName() + ' TODO: example';
    }
}
