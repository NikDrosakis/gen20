from transformers import DistilBertTokenizer, TFDistilBertForSequenceClassification
from datasets import load_dataset
import tensorflow as tf

# Load a dataset (for this example, we'll use a small subset from Hugging Face's datasets)
dataset = load_dataset("imdb", split="train[:1%]")  # Example: 1% of IMDB dataset

# Preprocess the text data
tokenizer = DistilBertTokenizer.from_pretrained("distilbert-base-uncased")
def preprocess_function(examples):
    return tokenizer(examples["text"], truncation=True, padding=True, max_length=512)

dataset = dataset.map(preprocess_function, batched=True)

# Convert to TensorFlow Dataset
def dataset_to_tf(dataset, batch_size):
    # Convert to tf.data.Dataset
    return tf.data.Dataset.from_tensor_slices((
        {
            'input_ids': dataset['input_ids'],
            'attention_mask': dataset['attention_mask']
        },
        dataset['label']
    )).batch(batch_size)

# Prepare dataset for training
batch_size = 8
train_dataset = dataset_to_tf(dataset, batch_size)

# Load the pre-trained DistilBERT model for text classification
model = TFDistilBertForSequenceClassification.from_pretrained("distilbert-base-uncased", num_labels=2)

# Define training arguments
epochs = 3
optimizer = tf.keras.optimizers.Adam(learning_rate=5e-5)

# Compile the model
model.compile(optimizer=optimizer, loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True), metrics=["accuracy"])

# Train the model
model.fit(train_dataset, epochs=epochs)

