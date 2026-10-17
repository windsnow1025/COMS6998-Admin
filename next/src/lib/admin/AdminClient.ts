import {getNestOpenAPIConfiguration} from "@/lib/common/APIConfig";
import {
  AdminApi,
  AdminCaptionResDto,
  AdminLlmCallResDto,
  AdminOverviewResDto,
  AdminPhotoDetailResDto,
  AdminPhotoPageResDto,
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
}
