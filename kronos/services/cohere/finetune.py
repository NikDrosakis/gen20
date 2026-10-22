from cohere.finetuning import (
    BaseModel as CohereBaseModel,
    FinetunedModel,
    Hyperparameters,
    Settings,
    WandbConfig
)

@router.post("/finetune")
async def finetune_model():
    try:
        # Define Hyperparameters
        hp = Hyperparameters(
            early_stopping_patience=10,
            early_stopping_threshold=0.001,
            train_batch_size=16,
            train_epoch=1,
            learning_rate=0.01,
        )

        # Define WandB Configuration (optional)
        wnb_config = WandbConfig(
            project="test-project",  # Replace with your project name
            api_key="<<wandbApiKey>>",  # Replace with your WandB API key
            entity="test-entity",  # Replace with your entity
        )

        # Create a fine-tuned model
        finetuned_model = co.finetuning.create_finetuned_model(
            request=FinetunedModel(
                name="test-finetuned-model",  # Replace with your model name
                settings=Settings(
                    base_model=CohereBaseModel(
                        base_type="BASE_TYPE_CHAT",  # Replace with the appropriate base model type
                    ),
                    dataset_id="my-dataset-id",  # Replace with your dataset ID
                    hyperparameters=hp,
                    wandb=wnb_config,  # Include this only if you use WandB for tracking
                ),
            )
        )

        # Return the fine-tuned model info
        return {"finetuned_model": finetuned_model}

    except cohere.error.CohereError as e:
        # Catch any Cohere-related exceptions and return an HTTP error
        raise HTTPException(status_code=500, detail=f"Cohere API error: {str(e)}")
    except Exception as e:
        # Catch any generic errors
        raise HTTPException(status_code=500, detail=f"Error during fine-tuning: {str(e)}")