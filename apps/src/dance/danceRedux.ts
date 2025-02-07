import {
  AnyAction,
  createAsyncThunk,
  createSlice,
  PayloadAction,
  ThunkDispatch,
} from '@reduxjs/toolkit';
import {SongData, SongMetadata} from './types';
import {queryParams} from '../code-studio/utils';
import {fetchSignedCookies} from '../utils';
import {
  getSongManifest,
  getSelectedSong,
  parseSongOptions,
  loadSong,
  unloadSong,
  loadSongMetadata,
} from './songs';
import GoogleBlockly from 'blockly/core';

export interface DanceState {
  selectedSong: string;
  songData: SongData;
  runIsStarting: boolean;
  currentAiModalField?: GoogleBlockly.Field;
  // Fields below are used only by Lab2 Dance
  isRunning: boolean;
  currentSongMetadata: SongMetadata | undefined;
}

const initialState: DanceState = {
  selectedSong: 'macklemore90',
  songData: {},
  runIsStarting: false,
  currentAiModalField: undefined,
  isRunning: false,
  currentSongMetadata: undefined,
};

// THUNKS

/** Loads the song manifest and initial song. */
export const initSongs = createAsyncThunk(
  'dance/initSongs',
  async (
    payload: {
      useRestrictedSongs: boolean;
      selectSongOptions: {
        selectedSong?: string;
        defaultSong?: string;
        isProjectLevel: boolean;
        freePlay: boolean;
      };
      onAuthError: (songId: string) => void;
      onSongSelected?: (songId: string) => void;
    },
    {dispatch}
  ) => {
    const {useRestrictedSongs, onAuthError, selectSongOptions, onSongSelected} =
      payload;

    // Check for a user-specified manifest file.
    const userManifest = queryParams('manifest') as string;
    const songManifest = await getSongManifest(
      useRestrictedSongs,
      userManifest
    );
    const songData = parseSongOptions(songManifest) as SongData;
    const selectedSong = getSelectedSong(songManifest, selectSongOptions);

    // Set selectedSong first, so we don't initially show the wrong song.
    dispatch(setSelectedSong(selectedSong));
    dispatch(setSongData(songData));

    loadSong(selectedSong, songData, (status: number) => {
      if (status === 403) {
        // Something is wrong, because we just fetched cloudfront credentials.
        onAuthError(selectedSong);
      }
    });

    await handleSongSelection(dispatch, selectedSong, onSongSelected);
  }
);

/** Called when a new song is selected. Unloads the previous song and loads the new song. */
export const setSong = createAsyncThunk(
  'dance/setSong',
  async (
    payload: {
      songId: string;
      onAuthError: (songId: string) => void;
      onSongSelected?: (songId: string) => void;
    },
    {dispatch, getState}
  ) => {
    const {songId, onAuthError, onSongSelected} = payload;
    const state = getState() as {dance: DanceState};
    const {selectedSong: lastSongId, songData} = state.dance;

    if (songId === lastSongId) {
      return;
    }

    dispatch(setSelectedSong(songId));
    unloadSong(lastSongId, songData);

    loadSong(songId, songData, async (status: number) => {
      if (status === 403) {
        // The cloudfront signed cookies may have expired.
        await fetchSignedCookies();
        loadSong(songId, songData, (status: number) => {
          if (status === 403) {
            // Something is wrong, because we just re-fetched cloudfront credentials.
            onAuthError(songId);
          }
        });
      }
    });

    await handleSongSelection(dispatch, songId, onSongSelected);
  }
);

async function handleSongSelection(
  dispatch: ThunkDispatch<unknown, unknown, AnyAction>,
  songId: string,
  onSongSelected?: (songId: string) => void
) {
  // Temporary branching to support both legacy Dance which manages the current song's
  // manifest within Dance.js, and Lab2 Dance which reads the current song's manifest from Redux.
  if (onSongSelected) {
    onSongSelected(songId);
  } else {
    const metadata = await loadSongMetadata(songId);
    dispatch(setCurrentSongMetadata(metadata));
  }
}

const danceSlice = createSlice({
  name: 'dance',
  initialState,
  reducers: {
    setSongData: (state, action: PayloadAction<SongData>) => {
      state.songData = action.payload;
    },
    setSelectedSong: (state, action: PayloadAction<string>) => {
      state.selectedSong = action.payload;
    },
    setRunIsStarting: (state, action: PayloadAction<boolean>) => {
      state.runIsStarting = action.payload;
    },
    setCurrentSongMetadata: (state, action: PayloadAction<SongMetadata>) => {
      state.currentSongMetadata = action.payload;
    },
    setCurrentAiModalField: (
      state,
      action: PayloadAction<GoogleBlockly.Field | undefined>
    ) => {
      state.currentAiModalField = action.payload;
    },
  },
});

export const {
  setSongData,
  setSelectedSong,
  setRunIsStarting,
  setCurrentSongMetadata,
  setCurrentAiModalField,
} = danceSlice.actions;
export const reducers = {dance: danceSlice.reducer};
