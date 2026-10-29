import {getNestOpenAPIConfiguration} from "@/lib/common/APIConfig";
import {
  AdminAccessPolicyResDto,
  AdminApi,
  AdminAvailableModelResDto,
  AdminCaptionResDto,
  AdminChainResDto,
  AdminConfigApi,
  AdminConfigControllerFindLlmCallsStepEnum,
  AdminDomainResDto,
  AdminEmailResDto,
  AdminExampleReqDto,
  AdminExampleResDto,
  AdminLlmCallPageResDto,
  AdminLlmCallResDto,
  AdminModelReqDto,
  AdminModelResDto,
  AdminModelUpdateReqDto,
  AdminOverviewResDto,
  AdminPhotoDetailResDto,
  AdminPhotoPageResDto,
  AdminPhotoReqDto,
  AdminPipelineStepResDto,
  AdminProviderReqDto,
  AdminProviderResDto,
  AdminProviderUpdateReqDto,
  AdminStepReqDto,
  AdminTermReqDto,
  AdminTermResDto,
  AdminUserResDto,
  AdminVotePageResDto,
  ImagesApi,
  PhotoResDto,
} from "@/client/nest";

export default class AdminClient {
  async fetchOverview(): Promise<AdminOverviewResDto> {
    const api = new AdminApi(getNestOpenAPIConfiguration());
    const res = await api.adminControllerFindOverview();
    return res.data;
  }

  async fetchUsers(): Promise<AdminUserResDto[]> {
    const api = new AdminApi(getNestOpenAPIConfiguration());
    const res = await api.adminControllerFindUsers();
    return res.data;
  }

  async fetchPhotos(limit: number, offset: number, q?: string): Promise<AdminPhotoPageResDto> {
    const api = new AdminApi(getNestOpenAPIConfiguration());
    const res = await api.adminControllerFindPhotos(limit, offset, q);
    return res.data;
  }

  async fetchPhoto(id: string): Promise<AdminPhotoDetailResDto> {
    const api = new AdminApi(getNestOpenAPIConfiguration());
    const res = await api.adminControllerFindPhoto(id);
    return res.data;
  }

  async updatePhoto(id: string, body: AdminPhotoReqDto): Promise<AdminPhotoDetailResDto> {
    const api = new AdminApi(getNestOpenAPIConfiguration());
    const res = await api.adminControllerUpdatePhoto(id, body);
    return res.data;
  }

  async fetchVotes(limit: number, offset: number): Promise<AdminVotePageResDto> {
    const api = new AdminApi(getNestOpenAPIConfiguration());
    const res = await api.adminControllerFindVotes(limit, offset);
    return res.data;
  }

  async fetchLlmCall(id: string): Promise<AdminLlmCallResDto> {
    const api = new AdminApi(getNestOpenAPIConfiguration());
    const res = await api.adminControllerFindLlmCall(id);
    return res.data;
  }

  async updateCaption(id: string, content: string): Promise<AdminCaptionResDto> {
    const api = new AdminApi(getNestOpenAPIConfiguration());
    const res = await api.adminControllerUpdateCaption(id, {content});
    return res.data;
  }

  async deleteCaption(id: string): Promise<void> {
    const api = new AdminApi(getNestOpenAPIConfiguration());
    await api.adminControllerRemoveCaption(id);
  }

  async createSeedPhoto(file: File, place?: string): Promise<PhotoResDto> {
    const api = new ImagesApi(getNestOpenAPIConfiguration());
    const res = await api.imagesControllerCreateSeed(file, place);
    return res.data;
  }

  async writeCaptions(id: string): Promise<PhotoResDto> {
    const api = new ImagesApi(getNestOpenAPIConfiguration());
    const res = await api.imagesControllerWriteCaptions(id);
    return res.data;
  }

  async deletePhoto(id: string): Promise<void> {
    const api = new ImagesApi(getNestOpenAPIConfiguration());
    await api.imagesControllerRemove(id);
  }

  // The prompt chain and what feeds it

  async fetchChains(): Promise<AdminChainResDto[]> {
    const api = new AdminConfigApi(getNestOpenAPIConfiguration());
    const res = await api.adminConfigControllerFindChains();
    return res.data;
  }

  async updateChain(slug: string, inMix: boolean): Promise<AdminChainResDto> {
    const api = new AdminConfigApi(getNestOpenAPIConfiguration());
    const res = await api.adminConfigControllerUpdateChain(slug, {inMix});
    return res.data;
  }

  async fetchSteps(): Promise<AdminPipelineStepResDto[]> {
    const api = new AdminConfigApi(getNestOpenAPIConfiguration());
    const res = await api.adminConfigControllerFindSteps();
    return res.data;
  }

  async updateStep(step: string, body: AdminStepReqDto): Promise<AdminPipelineStepResDto> {
    const api = new AdminConfigApi(getNestOpenAPIConfiguration());
    const res = await api.adminConfigControllerUpdateStep(step, body);
    return res.data;
  }

  async fetchAvailableModels(): Promise<AdminAvailableModelResDto[]> {
    const api = new AdminConfigApi(getNestOpenAPIConfiguration());
    const res = await api.adminConfigControllerFindAvailableModels();
    return res.data;
  }

  async fetchProviders(): Promise<AdminProviderResDto[]> {
    const api = new AdminConfigApi(getNestOpenAPIConfiguration());
    const res = await api.adminConfigControllerFindProviders();
    return res.data;
  }

  async createProvider(body: AdminProviderReqDto): Promise<AdminProviderResDto> {
    const api = new AdminConfigApi(getNestOpenAPIConfiguration());
    const res = await api.adminConfigControllerCreateProvider(body);
    return res.data;
  }

  async updateProvider(id: string, body: AdminProviderUpdateReqDto): Promise<AdminProviderResDto> {
    const api = new AdminConfigApi(getNestOpenAPIConfiguration());
    const res = await api.adminConfigControllerUpdateProvider(id, body);
    return res.data;
  }

  async deleteProvider(id: string): Promise<void> {
    const api = new AdminConfigApi(getNestOpenAPIConfiguration());
    await api.adminConfigControllerRemoveProvider(id);
  }

  async fetchModels(): Promise<AdminModelResDto[]> {
    const api = new AdminConfigApi(getNestOpenAPIConfiguration());
    const res = await api.adminConfigControllerFindModels();
    return res.data;
  }

  async createModel(body: AdminModelReqDto): Promise<AdminModelResDto> {
    const api = new AdminConfigApi(getNestOpenAPIConfiguration());
    const res = await api.adminConfigControllerCreateModel(body);
    return res.data;
  }

  async updateModel(id: string, body: AdminModelUpdateReqDto): Promise<AdminModelResDto> {
    const api = new AdminConfigApi(getNestOpenAPIConfiguration());
    const res = await api.adminConfigControllerUpdateModel(id, body);
    return res.data;
  }

  async deleteModel(id: string): Promise<void> {
    const api = new AdminConfigApi(getNestOpenAPIConfiguration());
    await api.adminConfigControllerRemoveModel(id);
  }

  async fetchTerms(): Promise<AdminTermResDto[]> {
    const api = new AdminConfigApi(getNestOpenAPIConfiguration());
    const res = await api.adminConfigControllerFindTerms();
    return res.data;
  }

  async createTerm(body: AdminTermReqDto): Promise<AdminTermResDto> {
    const api = new AdminConfigApi(getNestOpenAPIConfiguration());
    const res = await api.adminConfigControllerCreateTerm(body);
    return res.data;
  }

  async updateTerm(id: string, body: AdminTermReqDto): Promise<AdminTermResDto> {
    const api = new AdminConfigApi(getNestOpenAPIConfiguration());
    const res = await api.adminConfigControllerUpdateTerm(id, body);
    return res.data;
  }

  async deleteTerm(id: string): Promise<void> {
    const api = new AdminConfigApi(getNestOpenAPIConfiguration());
    await api.adminConfigControllerRemoveTerm(id);
  }

  async fetchExamples(): Promise<AdminExampleResDto[]> {
    const api = new AdminConfigApi(getNestOpenAPIConfiguration());
    const res = await api.adminConfigControllerFindExamples();
    return res.data;
  }

  async createExample(body: AdminExampleReqDto): Promise<AdminExampleResDto> {
    const api = new AdminConfigApi(getNestOpenAPIConfiguration());
    const res = await api.adminConfigControllerCreateExample(body);
    return res.data;
  }

  async updateExample(id: string, body: AdminExampleReqDto): Promise<AdminExampleResDto> {
    const api = new AdminConfigApi(getNestOpenAPIConfiguration());
    const res = await api.adminConfigControllerUpdateExample(id, body);
    return res.data;
  }

  async deleteExample(id: string): Promise<void> {
    const api = new AdminConfigApi(getNestOpenAPIConfiguration());
    await api.adminConfigControllerRemoveExample(id);
  }

  async fetchLlmCalls(
    limit: number,
    offset: number,
    step?: AdminConfigControllerFindLlmCallsStepEnum,
    q?: string,
  ): Promise<AdminLlmCallPageResDto> {
    const api = new AdminConfigApi(getNestOpenAPIConfiguration());
    const res = await api.adminConfigControllerFindLlmCalls(limit, offset, step, q);
    return res.data;
  }

  // Who may sign up

  async fetchAccessPolicy(): Promise<AdminAccessPolicyResDto> {
    const api = new AdminConfigApi(getNestOpenAPIConfiguration());
    const res = await api.adminConfigControllerFindAccessPolicy();
    return res.data;
  }

  async updateAccessPolicy(restricted: boolean): Promise<AdminAccessPolicyResDto> {
    const api = new AdminConfigApi(getNestOpenAPIConfiguration());
    const res = await api.adminConfigControllerUpdateAccessPolicy({restricted});
    return res.data;
  }

  async fetchDomains(): Promise<AdminDomainResDto[]> {
    const api = new AdminConfigApi(getNestOpenAPIConfiguration());
    const res = await api.adminConfigControllerFindDomains();
    return res.data;
  }

  async createDomain(domain: string): Promise<AdminDomainResDto> {
    const api = new AdminConfigApi(getNestOpenAPIConfiguration());
    const res = await api.adminConfigControllerCreateDomain({domain});
    return res.data;
  }

  async updateDomain(id: string, domain: string): Promise<AdminDomainResDto> {
    const api = new AdminConfigApi(getNestOpenAPIConfiguration());
    const res = await api.adminConfigControllerUpdateDomain(id, {domain});
    return res.data;
  }

  async deleteDomain(id: string): Promise<void> {
    const api = new AdminConfigApi(getNestOpenAPIConfiguration());
    await api.adminConfigControllerRemoveDomain(id);
  }

  async fetchEmails(): Promise<AdminEmailResDto[]> {
    const api = new AdminConfigApi(getNestOpenAPIConfiguration());
    const res = await api.adminConfigControllerFindEmails();
    return res.data;
  }

  async createEmail(email: string): Promise<AdminEmailResDto> {
    const api = new AdminConfigApi(getNestOpenAPIConfiguration());
    const res = await api.adminConfigControllerCreateEmail({email});
    return res.data;
  }

  async updateEmail(id: string, email: string): Promise<AdminEmailResDto> {
    const api = new AdminConfigApi(getNestOpenAPIConfiguration());
    const res = await api.adminConfigControllerUpdateEmail(id, {email});
    return res.data;
  }

  async deleteEmail(id: string): Promise<void> {
    const api = new AdminConfigApi(getNestOpenAPIConfiguration());
    await api.adminConfigControllerRemoveEmail(id);
  }
}
